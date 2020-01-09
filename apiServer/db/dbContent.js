const mongoose = require("mongoose");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const ContentSchema = new mongoose.Schema ( //Update Needed
    {
        type: { type: String, required: true},
        containertype: { type: Number, required: false },
        containerid: { type: Number, required: false },
        userid: { type: Number, required: false },
        username: { type: String, required: false },
        name: { type: String, required: false },
        email: { type: String, required: false },   
        creationdate: { type: Date, required: false },
        modificationdate: { type: Date, required: false },
        blogpostid: { type: Number, required: false },
        blogid: { type: Number, required: false },
        subject: { type: String, required: false },
        body: { type: String, required: false },
        publishdate: { type: Date, required: false },
        blogname: { type: String, required: false },
        description: { type: String, required: false },
        internaldocid: { type: Number, required: false },
        versionid: { type: Number, required: false },
        title: { type: String, required: false },
        summary: { type: String, required: false },
        bodytext: { type: String, required: false },
        filename: { type: String, required: false },
        contenttype: { type: String, required: false },
        filesize: { type: Number, required: false },
        social:  { type: [{
            type: { type: String, required: false },
            name: { type: String, required: false },
            description: { type: String, required: false}
        }]}
    },
    { timestamps: false }
); 

ContentSchema.plugin(aggregatePaginate);
global.ContentModel = global.ContentModel || mongoose.model("content", ContentSchema, process.env.MONGO_CONTENT_COLLECTION);
module.exports = global.ContentModel;
