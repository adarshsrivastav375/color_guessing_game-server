import { User } from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateTokens = async (userId) => {
  try {
    const user = User.findById(userId);
    const accessToken = user.generateRefreshToken();
    const refreshToken = user.generateAceesToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "some thing went wrong while generating the token");
  }
};
//register user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, mobile, password, referralBy } = req.body;
  if ([name, email, mobile, password].some((field) => field === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { mobile }],
  });
  if (existedUser) {
    throw new ApiError(409, " Email or mobile already exsist");
  }
  const user = await User.create({
    name,
    email,
    mobile,
    password,
    referralBy: referralBy ? referralBy : null,
  });
  const createdUser = await User.findById(user._id).select(
    "-walletBalance -transactions -refreshToken -password"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user created successfully"));
});

//log in
const loginUser = asyncHandler(async (req, res) => {
  const { email, mobile, password } = req.body;
  if (!email || !mobile) {
    throw new ApiError(400, "email or mobile is requird");
  }
  const user = await User.findOne({
    $or: [{ email }, { mobile }],
  });
  if (!user) {
    throw new ApiError(404, "user not found");
  }
  const isUserValid = await user.isPasswordCorrect(password);
  if (!isUserValid) {
    throw new ApiError(401, "invalid user credentials");
  }
  const { accessToken, refreshToken } = await generateTokens(usre._id);
  const loggedinUser = await User.finedOne(user._id).select(
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
          user: loggedinUser,
          accessToken,
          refreshToken,
        },
        "user LoggedIn successfully"
      )
    );
});
//logout
const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
    },
  });
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

export { registerUser, loginUser, logoutUser };
