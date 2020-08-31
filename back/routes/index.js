const express       = require('express');
const router        = express.Router();

router.get('/messages', async(request, response, next)=>{
    return response.end();
});

module.exports = router;