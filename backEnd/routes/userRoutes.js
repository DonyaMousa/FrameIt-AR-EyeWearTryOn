const express = require('express');
const router = express.Router();
const {
    authUser,
    registerUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
} = require('../controllers/userController');

router.post('/login', authUser);
router.route('/').post(registerUser).get(getUsers);
router
    .route('/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;
