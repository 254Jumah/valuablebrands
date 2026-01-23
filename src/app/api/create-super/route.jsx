import User from "@/app/models/User";
import connect from "@/app/utils/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    await connect();

    // Check if superadmin already exists
    const existingSuperadmin = await User.findOne({ role: "superadmin" });

    if (existingSuperadmin) {
      return NextResponse.json(
        { message: "Superadmin already exists" },
        { status: 400 }
      );
    }

    // 🔐 HASH PASSWORD
    const plainPassword = "1234"; // CHANGE THIS
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Create superadmin
    const superadmin = await User.create({
      name: "Super Admin",
      email: "jumahtitus@gmail.com", // CHANGE THIS
      password: hashedPassword, // ✅ SAVED AS HASH
      role: "superadmin",
    });

    return NextResponse.json(
      {
        message: "Superadmin created successfully",
        user: {
          id: superadmin._id,
          email: superadmin.email,
          role: superadmin.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
