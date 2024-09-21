const bcrypt = require('bcrypt');

const User = require("../models/User");

const auth = require("../auth");
const { errorHandler } = auth;


module.exports.registerUser = async (req, res) => {
    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(409).send({ 
                error: 'Email already in use' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
            return res.status(400).send({ 
                error: 'Email Invalid' 
            });
        }

        // Validate mobile number length


        // Validate password length
        if (req.body.password.length < 8) {
            return res.status(400).send({ 
                error: 'Password must be atleast 8 characters' 
            });
        }

        // If all validations pass, create a new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10)
        });

        const result = await newUser.save();
        return res.status(201).send({
            message: 'Registered Successfully',
        });

    } catch (error) {
        return errorHandler(error, req, res);
    }
};


module.exports.loginUser = async (req, res) => {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(req.body.email)) {
        return res.status(400).send({error: 'Invalid Email'});
    }

    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).send({error: 'No email found'});

        } else {
            const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.password);

            if (isPasswordCorrect) {
                return res.status(200).send({access : auth.createAccessToken(user)})
            } else {
                return res.status(401).send({ error: 'Email and password do not match' });
            }
        }

    } catch (err) {
        return errorHandler (err, req, res);
    }
}


module.exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id,['-id']);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        } else {
            user.password = undefined;
            return res.status(200).send({ user });
        }
    }
    catch (error) {
        return errorHandler(error, req, res);
    }
}

// module.exports.setAsAdmin = async (req, res) => {
//     try {
//         const userId = req.params.id;
//         const user = await User.findById(userId,['-id']);

//         if (!user) {
//             return res.status(404).send({ error: 'User not found' });
//         }

//         user.isAdmin = true;
//         await user.save();
//         user.password = undefined;
//         res.status(200).send({ 
//             updatedUser : user,
//             message: 'User updated successfully'});
//     } catch (error) {
//         res.status(500).send({ error: 'Failed in Find', details: error.message });
//     }
// };


module.exports.setAsAdmin = async (req, res) => {
    try {
        const userId = req.params.id;


        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Set the user as admin
        user.isAdmin = true;
        await user.save();

        res.status(200).send({ 
            updatedUser: user, 
            message: 'User updated successfully'
        });
    } catch (error) {
        //console.error('Error in setAsAdmin:', error);  
        res.status(500).send({ 
            error: 'Failed to update user role', 
            details: error.message 
        });
    }
};


module.exports.updatePassword = async (req, res) => {
    try {
      const { newPassword } = req.body;
      const { id } = req.user; 
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await User.findByIdAndUpdate(id, { password: hashedPassword });
  
      res.status(201).send({ message: 'Password reset successfully' });
    } catch (error) {
      //console.error(error);
      res.status(500).send({ message: 'Internal server error' });
    }
  };


module.exports.checkEmailExists = (req, res) => {

    if(req.body.email.includes("@")){
        return User.find({ email : req.body.email })
        .then(result => {

            // if there is a duplicate email (email exists)
            if (result.length > 0) {
                return res.status(409).send({message: "Duplicate email found"});
            } else { // if there is no duplicate email
                return res.status(404).send({message: "No duplicate email found"});
            };
        })
        .catch(error => errorHandler(error, req, res));
    }
    else{
        res.status(400).send({message: "Invalid email format"}); // false - Invalid email
    }
};





module.exports.updatePassword = async (req, res) => {
  try {
    // Get the user ID from the authenticated token
    const userId = req.user.id;
    //console.log(`User ID from token: ${userId}`);

    // Retrieve the new password from the request body
    const { password } = req.body;
   
    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    //console.log('Hashed password:', hashedPassword);

    // Update the user's password in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      //console.log('User not found for password update');
      return res.status(404).json({ message: 'User not found' });
    }

    // Log the updated user profile
    //console.log('Updated User after password change:', updatedUser);

    // Generate a new token with the updated information
    const token = jwt.sign(
      {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin, // Assuming the user has an isAdmin property
      },
      process.env.JWT_SECRET_KEY, // Your JWT secret key
      { expiresIn: '1h' } // Token expiration time (optional)
    );

    // Log the new token for debugging
    //console.log('New token generated after password change:', token);

    // Send the updated user profile and the new token back in the response
    res.status(200).json({
      message: 'Password updated successfully',
      user: updatedUser,
      token, // Return the new token
    });
  } catch (error) {
    //console.error('Error updating password:', error);
    res.status(500).json({ message: 'Failed to update password' });
  }
};



const jwt = require('jsonwebtoken'); // Ensure jwt is imported for token generation

module.exports.updateProfile = async (req, res) => {
  try {
    // Get the user ID from the authenticated token
    const userId = req.user.id;
    //console.log(`User ID from token: ${userId}`);

    // Retrieve the updated profile information from the request body
    const { username } = req.body;
    //console.log(`Updated username from request body: ${username}`);

    // Update the user's profile in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      //console.log('User not found for update');
      return res.status(404).json({ message: 'User not found' });
    }

    // Log the updated user profile
    //console.log('Updated User:', updatedUser);

    // Generate a new token with the updated information
    const token = jwt.sign(
      {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin, // Assuming the user has an isAdmin property
      },
      process.env.JWT_SECRET_KEY, // Your JWT secret key
      { expiresIn: '1h' } // Token expiration time (optional)
    );

    // Log the new token for debugging
    //console.log('New token generated:', token);

    // Send the updated user profile and the new token back in the response
    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
      token, // Return the new token
    });
  } catch (error) {
    //console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

  
module.exports.getAllProfiles =  async (req, res) => {
    try {
        const users = await User.find().select('-password');
        return res.status(200).send(users);
    } catch (err) {
        errorHandler(err, req, res);
    }
}

