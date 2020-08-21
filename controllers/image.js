const fs = require('fs'),
    path = require('path'),
    sidebar = require('../helpers/sidebar'),
    Models = require('../models');

module.exports = {
    index: function(req, res) {
        const viewModel = {
            image: {},
            comments: []
        };

        Models.Image.findOne({ filename: { $regex: req.params.image_id } },
            (err, image)=>{
                if (err) { throw err; }
                if (image) {
                    image.views = image.views + 1;
                    image.save();
                    var views = image.views;
                    var title = image.title;
                    var filename = image.filename;
                    var uniqueId = image.uniqueId;
                    var likes = image.likes;
                    var timestamp = image.timestamp;
                    viewModel.image = {views, title, filename,
                      uniqueId, likes, timestamp};


                    Models.Comment.find(
                        { image_id: image._id},
                        {},
                        { sort: { 'timestamp': 1 }},
                        (err, comments)=>{
                            viewModel.comments = comments;
                            sidebar(viewModel, (viewModel)=>{
                                res.render('image', viewModel);
                            });
                        }
                    );
                } else {
                    res.redirect('/');
                }
            });
    },
    create: function(req, res) {
        var saveImage = ()=>{
            var possible = 'abcdefghijklmnopqrstuvwxyz0123456789',
                imgUrl = '';

            for(var i=0; i < 6; i+=1) {
                imgUrl += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            Models.Image.find({ filename: imgUrl }, (err, images)=>{
                if (images.length > 0) {
                    saveImage();
                } else {
                  const tempPath = req.file.path,
                          ext = path.extname(req.file.originalname).toLowerCase(),
                          targetPath = path.resolve(`./public/upload/${imgUrl}${ext}`);

                    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
                        fs.rename(tempPath, targetPath, (err)=>{
                            if (err) { throw err; }

                            var newImg = new Models.Image({
                                title: req.body.title,
                                filename: imgUrl + ext,
                                description: req.body.description
                            });
                            newImg.save((err, image)=>{
                                console.log(`Successfully inserted image: ${image.filename}`);
                                res.redirect(`/images/${image.uniqueId}`);
                            });
                        });
                    } else {
                        fs.unlink(tempPath, ()=>{
                            if (err) throw err;

                            res.json(500, {error: 'Only image files are allowed.'});
                        });
                    }
                }
            });
        };

        saveImage();
    },
    like: function(req, res) {
        res.json({likes: 1});
    },
    comment: function(req, res) {
        res.send('The image:comment POST controller');
    }
};
