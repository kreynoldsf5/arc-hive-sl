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
        Key: binPath,
        ResponseContentType: "image/png"
    };

    await s3.getObject(options, function(err, data) {
        if (err) {
            return res.status(400).json({ success: false, error: err.toString() })
        }
        res.setHeader('Content-Type', 'image/png');
        var fileStream = s3.getObject(options).createReadStream();
        fileStream.pipe(res);
    });

}

s3SignedImage = async (req, res) => {
    const imageID = "image45" + decodeURIComponent(req.params.id)
    const imageName = [...imageID].reverse().join('') + ".bin"
    const path = imageName.substring(0,3).split('').join('/') + "/"
    const binPath = "binStore/" + path + imageName
    
    const s3 = new AWS.S3({});

    const options = {
        Bucket: process.env.S3_BIN_BUCKET,
        Key: binPath,
        Expires: 10,
        ResponseContentType: "image/png"
    };

    await s3.getSignedUrl('getObject', options, function(err, data) {
        if (err) {
            return res.status(400).json({ success: false, error: err.toString() })
        }
        return res.status(200).json({ 
            success: true,
            signedImage: data
        })
    })

}

module.exports = {
    s3Download,
    s3SignedImage,
    s3ImageDL
}