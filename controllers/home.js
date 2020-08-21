const sidebar = require('../helpers/sidebar'),
ImageModel = require('../models').Image,
mongoose = require('mongoose');

module.exports = {
    index(req, res){
        const viewModel = {
            images: []
        };

        ImageModel.find({}, {}, { sort: { timestamp: -1 }}, (err, images)=>{
            if (err) { throw err; }
            
            images.forEach((item, i) => {
                var uniqueId = item.uniqueId;
                var filename = item.filename;
                var title = item.title;
                viewModel.images.push({
                    uniqueId,
                    filename,
                    title
                });
            });

            //viewModel.images = images;
            console.log('images', viewModel.images);
            sidebar(viewModel, (viewModel)=>{
                res.render('index', viewModel);
            });
        });
    }
};
