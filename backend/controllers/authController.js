const User = require('../models/User')


const registerUser = async (req , res) => {

    const { username, email, password, phone, profileImage, location, role } = req.body

    try {
    const existingUser = await User.findOne({email}).exec()
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "This Email is already registered.",
            errorCode: 'EMAIL_EXISTS'
        });
    }


    const newUser = new User({
        username,
        email,
        password,
        phone,
        location,
        profileImage,
        role: role || 'buyer'
    })

    await newUser.save()

    res.status(201).json({
        success: true,
        message: 'User registered successfully.',
        data: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
        }
    }) 
        } catch(error) {

            res.status(500).json({
                success: false,
                message: "Server error ,Please try again later." + error.message,
                errorCode: "SERVER_ERROR"
            })

    }

}


module.exports = {
    registerUser
}