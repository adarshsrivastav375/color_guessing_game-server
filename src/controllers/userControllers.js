import { User } from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, mobile, password, referralBy } = req.body;
  if (
    [name, email, mobile, password].some(
      (field) => field?.trim() === ""
    )
  ) {
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
    referralBy: referralBy ? referralBy : "",
  });
  const createdUser = await User.findByIdAndUpdate(
    user._id,
    {
      referralCode: user._id,
    },
    { new: true }
  ).select("- walletBalance -transactions -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "user created successfully"));
});

export { registerUser };
