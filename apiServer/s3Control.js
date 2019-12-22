const AWS = require('aws-sdk');

s3Download = async (req, res) => {
    const binPath = "binStore/" + decodeURIComponent(req.params.binpath);
    const s3 = new AWS.S3({});
  
    const options = {
        Bucket: process.env.S3_BIN_BUCKET,
        Key: binPath
    };

   await s3.getObject(options, function(err, data) {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }

        res.attachment(decodeURIComponent(req.params.filename));
        var fileStream = s3.getObject(options).createReadStream();
        fileStream.pipe(res);
    });
};

s3ImageDL = async (req, res) => {
    const imageID = "image45" + decodeURIComponent(req.params.id)
    const imageName = [...imageID].reverse().join('') + ".bin"
    const path = imageName.substring(0,3).split('').join('/') + "/"
    const binPath = "binStore/" + path + imageName
    
    const s3 = new AWS.S3({});

    const options = {
        Bucket: process.env.S3_BIN_BUCKET,
        Key: binPath
    };

    await s3.getObject(options, function(err, data) {
        if (err) {
            return res.status(400).json({ success: false, error: err.toString() })
        }
        var fileStream = s3.getObject(options).createReadStream();
        fileStream.pipe(res);
    });

}

module.exports = {
    s3Download,
    s3ImageDL
}