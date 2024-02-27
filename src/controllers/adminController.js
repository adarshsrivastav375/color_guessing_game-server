import jwt from "jsonwebtoken";
import { Admin } from "../models/adminSchema.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateTokens = async (userId) => {
  try {
    const admin = await Admin.findById(userId);
    const refreshToken = Admin.generateRefreshToken();
    const accessToken = Admin.generateAccessToken();

    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "some thing went wrong while generating the token");
  }
};
//register user
const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, mobile, password } = req.body;
  if ([name, email, mobile, password].some((field) => field === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const admin = await Admin.create({
    name,
    email,
    mobile,
    password,
  });
  const createdAdmin = await Admin.findById(admin._id).select(
    "-refreshToken -password"
  );
  if (!createdAdmin) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdAdmin, "user created successfully"));
});

//log in
const adminLogin = asyncHandler(async (req, res) => {
  const { email, mobile, password } = req.body;
  if (!email && !mobile) {
    throw new ApiError(400, "email or mobile is requird");
  }
  const admin = await Admin.findOne({
    $or: [{ email }, { mobile }],
  });
  if (!admin) {
    throw new ApiError(404, "user not found");
  }
  const isUserValid = await admin.isPasswordCorrect(password);
  if (!isUserValid) {
    throw new ApiError(401, "invalid user credentials");
  }
  const { accessToken, refreshToken } = await generateTokens(admin._id);

  const loggedinAdmin = await Admin.findOne(user._id).select(
    "-refreshToken -password"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          admin: loggedinAdmin,
          accessToken,
          refreshToken,
        },
        "admin LoggedIn successfully"
      )
    );
});
//logout
const logoutadmin = asyncHandler(async (req, res) => {
  Admin.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user loggedOut"));
});
// refresh access token
const refreshAccessTokenAdmin = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_KEY
    );
    const user = await Admin.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});
//password change
const changePasswordAdmin = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await Admin.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});
//get current user
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAdminDetails = asyncHandler(async (req, res) => {
  const { name, mobile } = req.body;

  if (!name || !mobile) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await Admin.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        name,
        mobile,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});
export {
  registerAdmin,
  adminLogin,
  logoutadmin,
  refreshAccessTokenAdmin,
  changePasswordAdmin,
  getCurrentUser,
  updateAdminDetails,
};
