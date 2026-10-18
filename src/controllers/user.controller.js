import fs from "fs/promises";
import path from "path";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api_error.js";
import { ApiResponse } from "../utils/api_response.js";
import { User } from "../models/user.model.js";
import { supabase } from "../utils/supabase.js";

const generateRefAccToken = async (id) => {
  try {
    const user = await User.findById({ id });
    if (!user) {
      throw new ApiError(401, "Unable to find user");
    }

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(400, "Something went wrong while generating token");
  }
}

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const avatarPath = req.file?.path;
  let avatarUrl = "";

  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    await fs.unlink(avatarPath);
    throw new ApiError(400, "User already exists");
  }

  if (avatarPath) {
    const file = await fs.readFile(avatarPath);
    const extension = path.extname(req.file.originalname.toLowerCase());

    const mimeTypes = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
    };

    const contentType = mimeTypes[extension];

    if (!contentType) {
      throw new ApiError(400, "Unsupported image format");
    }

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(`users/${Date.now()}-${req.file.filename}`,
        file,
        {
        contentType: contentType
        }
      );

    if (error) {
      throw new ApiError(500, "Failed to uplaod avatar");
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(data.path);

    avatarUrl = urlData.publicUrl;
    await fs.unlink(avatarPath);
    console.log("deleted");
  }

  const user = await User.create({
    name,
    email,
    password,
    avatar: avatarUrl
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Unable to create the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(
      201,
      {
        user: createdUser
      },
      "User created successfully"
    ));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and Password are required");
  }

  const user = await User.findByEmail({ email });
  if (!user) {
    throw new ApiError(400, "Unable to find the user");
  }

  const isPassValid = await user.isPasswordCorrect(password);
  if (!isPassValid) {
    throw new ApiError(400, "Incorrect Password");
  }
  const { accessToken, refreshToken } = await generateRefAccToken(user._id);
  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly:  true,
    secure: true,
    sameSite: "strict"
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          loggedUser
        },
        "User logged-in successfully"
      )
    )
});

// the below are the secure routes

const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;
  const loggedOutUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      refreshToken: ""
    },
    {
      new: true
    }
  );

  if (!loggedOutUser) {
    throw new ApiError(401, "Unable to log out the user");
  }

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  };

  return res
    .status(200)
    .cookie("accessToken", options)
    .cookie("refreshToken", options)
    .json(
      new ApiResponse(
        200,
        {},
        "the user has been logged out successfully"
      )
    );
});

const renewAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookie?.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(400, "UnAuthorized access");
  }

  try {
    const decodedToken = await jwt.verify(incomingRefreshToken, process.env.RT_SECRET);
    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh Token");
    }

    if (incomingRefreshToken != user.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateRefAccToken(user._id);
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "strict"
    }

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {},
          "access token has been renewed"
        )
      )
  } catch (err) {
    console.log("error while renewing the access token, ", err);
    throw new ApiError(400, "Error while renewing the access token");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(
    req.user._id
  ).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(400, "unable to retrieve the user");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user },
        "user data retrieved successfully"
      )
    )
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const avatarPath = req.file?.path;

  if (!name && !avatarPath) {
    throw new ApiError(400, "make changes to atleast one field");
  }

  let avatarUrl = "";
  let userData = {};

  if (name) {
    userData.name = name;
  }

  if (avatarPath) {
    const file = await fs.readFile(avatarPath);
    const extension = path.extname(req.file.originalname.toLowerCase());

    const mimeTypes = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
    };

    const contentType = mimeTypes[extension];

    if (!contentType) {
      throw new ApiError(400, "Unsupported file type");
    }

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(`users/${Date.now()}-${req.file.filename}`,
        file,
        {
          contentType: contentType
        }
      )

    if (error) {
      throw new ApiError(500, "failed to uplaod avatar");
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(data.path);

    avatarUrl = urlData.publicUrl;
    await fs.unlink(avatarPath);

    userData.avatar = avatarUrl;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    userData,
    { new: true }
  ).select(
    "-password -refreshToken"
  );

  if (!updatedUser) {
    throw new ApiError(400, "Unable to update the data");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updatedUser },
        "User has been updated successfully"
      )
    );
});

const changePassword = asyncHandler(async (req, res) => {
  const { newPassword, oldPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!newPassword || !oldPassword) {
    throw new ApiError(400, "Old and New Passwords required");
  }

  const isPassCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPassCorrect) {
    throw new ApiError(400, "Old Password is not correct");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "User password updated successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  renewAccessToken,
  getCurrentUser,
  updateProfile,
  changePassword
};
