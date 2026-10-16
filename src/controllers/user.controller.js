import fs from "fs/promises";
import path from "path";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api_error.js";
import { ApiResponse } from "../utils/api_response.js";
import { User } from "../models/user.model.js";
import { supabase } from "../utils/supabase.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const avatarPath = req.file?.path;
  let avatarUrl = "";

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
      console.log("supabase error: ", error);
      console.log("MIME:", req.file.mimetype);
      throw new ApiError(500, "Failed to uplaod avatar");
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(data.path);

    const avatarUrl = urlData.publicUrl;
    await fs.unlink(avatarPath);
  }

  const user = await User.create({
    name,
    email,
    password,
    avatar: avatarPath
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

export { registerUser };
