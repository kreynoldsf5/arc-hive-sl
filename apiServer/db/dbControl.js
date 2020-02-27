const Content = require('./dbContent')

getDocByID = async (body) => {
    if (body.blogpostid) {
        var query = { blogpostid: body.blogpostid, published: true }
    } 
    else if (body.uid) {
        var query = { uri: body.uid, published: true }
    }
    else {
        throw 'Invalid Document :('
    }
    //Return just enough info to make a link
    if (body.docLink) {
        var selected = '_id uri binpath filename humanfs'
    }
    else {
        var selected = '_id type subject uri title fullname email prettycreation prettymodification summary body bodytext binpath filename filesize humanfs contenttype icon social attachments threaduri threadlen messages'
    }
    //Make the query
    return Content.findOne(query).select(selected).lean().exec()
};

masterSearch = (body) => {
    /*Order and Sort */
    if (body.order === 'as') { var morder = 1; } else { var morder = -1; } //descending default
    if (body.sort ==="cd") { var msort = { creationdate: morder }; }
    else if (body.sort === "md") { var msort = { modificationdate: morder };} 
    else { var msort = {score: morder };} //textScore default
    
    /*doc Type */
    if (body.type === 'do') { var mtype = "document"; } 
    else if (body.type === "bp") { var mtype = "blogpost"; }
    else if (body.type === "me") { var mtype = "message"; }
    else { var mtype = {$exists: true}; } //All Content Default
    
    /* search type */
    if (body.search === 'ti') {
        /* Projection */
        var mproject = { 
        _id: 1, uri:1, icon:1, subject:1, title:1, fullname:1, email:1, creationdate:1, modificationdate:1, prettycreation:1, prettymodification:1, safebody:1, safesummary:1, social:1
        }
        /* Match */
        var mmatch= { $or: [
            { title: { }},
        ], published: true, type: mtype }
        /* Build the Aggregate */
        var aggregate = Content.aggregate([
            { $match: mmatch },
            { $project: mproject },
            { $sort: msort }
        ]);
    } else if (body.search === 'au') {
        var mproject = {
        _id: 1, uri:1, icon:1, subject:1, title:1, fullname:1, email:1, creationdate:1, modificationdate:1, prettycreation:1, prettymodification:1, safebody:1, safesummary:1, social:1
        }
        var mmatch= { 
            $expr: {
                $or:[
                    { $gt: [{ $indexOfCP: [ {$toUpper: "$fullname"}, {$toUpper: body.query} ]}, -1]},
                    { $gt: [{ $indexOfCP: [ {$toUpper: "$username"} , {$toUpper: body.query} ]}, -1]},
                    { $gt: [{ $indexOfCP: [ {$toUpper: "$email"}, {$toUpper: body.query} ]}, -1]},
                ]},
            published: true,
            type: mtype
        }
        var aggregate = Content.aggregate([
            { $match: mmatch },
            { $project: mproject },
            { $sort: msort }
        ]);
    } else {
        var mproject = { score: { $meta: "textScore" },
        _id: 1, uri:1, icon:1, subject:1, title:1, fullname:1, email:1, creationdate:1, modificationdate:1, prettycreation:1, prettymodification:1, safebody:1, safesummary:1, social:1
        }
        var mmatch = { $text: { $search: body.query }, published: true, type: mtype }
        var aggregate = Content.aggregate([
            { $match: mmatch },
            { $project: mproject },
            { $match: { score: { $gt: parseFloat(body.score) } } },
            { $sort: msort }
        ]);
    }

    const options = {
        page:     body.page, 
        limit:    body.limit
    };
    
    return Content.aggregatePaginate(aggregate, options)
};

module.exports = {
    getDocByID,
    masterSearch
};

