// routes/index.js

module.exports = function(app, fs, User, Savedimage, Contact)
{
    // GET user
    app.get('/api/user/:user_name', function(req, res){
      console.log("GET : /api/user/:user_name");
      User.findOne({alias: req.params.user_name}, function(err, user){
          if(err) return res.status(500).json({result: "failure", error: err});
          if(!user) return res.status(404).json({result: "failure", error: 'user not found'});
          user.set("result", "success");
          res.json(user);
      })
    });

    // CREATE user
    app.post('/api/user/:user_name', function(req, res){
      console.log("POST : /api/user/:user_name");
      var user = new User();
      user.alias = req.params.user_name;
      console.log(user.alias);
      user.unique_id = "0000";
      user.published_date = new Date().getTime();
      console.log(user.published_date);

      user.save(function(err){
          if(err){
              console.error(err);
              res.json({result: "failure", message: "Faile to createUser > " + user.alias});
              return;
          }
          res.json({result: "Succesfully create User > " + user.alias});
      });
    });

    // GET contact lists
    app.get('/api/contacts/:user_name', function(req, res){
      console.log("GET : /api/contacts/:user_name");
        User.findOne({alias: req.params.user_name}, function(err, user){
            if(err) return res.status(500).json({result: "failure", error: err});
            if(!user) return res.status(404).json({result: "failure", error: 'user not found'});

            Contact.find({owner : req.params.user_name}, function(err, contact){
              res.json(contact);
            }
          )
        })
    });

    // UPDATE contact lists
    app.put('/api/contacts/:user_name', function(req, res){
      console.log("PUT : /api/contacts/:user_name");
      var raw_owner = req.params.user_name;
      User.findOne({alias: raw_owner}, function(err, user){
          if(err){
            console.log(err);
            return res.status(500).json({result: "failure", error: 'database failure' });
          }
          if(!user) return res.status(404).json({result: "failure", error: 'user not found' });

          console.log(req.body.contacts);

          var i = 0;
          var new_count = 0;
          var m_count = 0;

          function recurse(n, m){
            var new_count = n;
            var m_count = m;
            if(i < req.body.contacts.length){
              var raw_name = req.body.contacts[i].name;
              var raw_number = req.body.contacts[i].number;
              var raw_email = req.body.contacts[i].email;

              Contact.findOne({owner: raw_owner, name : raw_name}, function(err, contact){
                if(err){
                  return;
                }
                if(!contact){
                  console.log("Make Newone");
                  var cont = new Contact();
                  cont.owner = req.params.user_name;
                  console.log("owner : " + cont.owner);
                  cont.name = raw_name;
                  console.log("name : " + cont.name);
                  cont.number = raw_number;
                  console.log("number : " + cont.number);
                  cont.email = raw_email;
                  console.log("email : " + cont.email);

                  cont.save(function(err){
                      if(err){
                          console.error(err);
                          res.json({result: "failure", message: "save error"});
                          return;
                      }
                  });
                  new_count++;
                }else{
                  console.log(raw_name + " of " + raw_owner + " is already exist!");
                  contact.number = raw_number;
                  console.log("number(m) : " + contact.number);
                  contact.email = raw_email;
                  console.log("email(m) : " + contact.email);

                  contact.save(function(err){
                      if(err){
                          console.error(err);
                          res.json({result: "failure", message: "modify error"});
                          return;
                      }
                  });
                  m_count++;
                }
              });

              i++;
              recurse(new_count, m_count);
            }else{
              var message = "Successfully Update : " + new_count + " item created, " + m_count + " item modified";
              res.json({result: message});
            }
          }
          recurse(0, 0);
      });
    });

    // DETETE contacts list
    app.delete('/api/contacts/:user_name', function(req, res){
      console.log("DELETE : /api/contacts/:user_name");
      var raw_owner = req.params.user_name;
      User.findOne({alias: raw_owner}, function(err, user){
          if(err){
            console.log(err);
            return res.status(500).json({result: "failure", error: 'database failure' });
          }
          if(!user) return res.status(404).json({result: "failure", error: 'user not found' });

          console.log(req.body.contacts);

          var i = 0;

          function recurse_deletion(d){
            var d_count = d;
            if(i < req.body.contacts.length){
              var raw_name = req.body.contacts[i].name;
              var raw_number = req.body.contacts[i].number;
              var raw_email = req.body.contacts[i].email;

              Contact.remove({owner: raw_owner, name : raw_name, number : raw_number, email : raw_email}, function(err, output){
                if(err) return;
                if(!output.result) return;
              });

              i++;
              recurse_deletion(d_count);
            }else{
              var message = "Successfully deleted : " + d_count + " item";
              res.json({result: message});
            }
          }

          recurse_deletion(0);
      });
    });



    // GET image list
    app.get('/api/imagelist/:user_name/', function(req, res){
      console.log("GET : /api/imagelist");
      var owner = req.params.user_name;
      var file_name = req.params.file_name;
      Savedimage.find({owner : owner}, function(err, savedimage){
        if(err) return res.status(500).json({result: "failure", error: err});
        if(!savedimage) return res.status(404).json({result: "failure", error: 'Image not found'});

        res.json(savedimage);
      });
    });

    // GET image
    app.get('/api/image/:user_name/:file_name', function(req, res){
      console.log("GET : /api/image");
      var owner = req.params.user_name;
      var file_name = req.params.file_name;
      Savedimage.findOne({owner : owner, name : file_name}, function(err, savedimage){
        if(err) return res.status(500).json({result: "failure", error: err});
        if(!savedimage) return res.status(404).json({result: "failure", error: 'Image not found'});

        var savename = "images/" + owner + "_" + file_name;

        function base64_encode(file) {
            // read binary data
            var bitmap = fs.readFileSync(file);
            // convert binary data to base64 encoded string
            return new Buffer(bitmap).toString('base64');
        }
        var base64str = base64_encode(savename);
        // console.log("start");
        // console.log(base64str);
        // console.log("end");
        res.json({owner : owner, name : file_name, m_date : savedimage.m_date, data : base64str});
      });
    });

    // Put the image
    app.put('/api/image', function(req, res){
      console.log("PUT : /api/image");
      var owner = req.body.user_name;
      var file_name = req.body.name;
      Savedimage.findOne({owner : owner, name : file_name}, function(err, savedimage){
        if(err) return res.status(500).json({result: "failure", error: err});
        if(!savedimage){
          var savedimage = new Savedimage();
          savedimage.owner = owner;
          savedimage.name = file_name;
        }
        savedimage.m_date = req.body.m_date;
        //savedimage.bs = req.body.data;

        var savename = "images/" + owner + "_" + file_name;
        fs.writeFile(savename, req.body.data, 'base64', function(err) {
          if(err){
            console.log("error", err);
            res.json({result: "failure", result: "Error in converting"});
            return;
          }
        });

        savedimage.save(function(err){
            if(err){
                console.error(err);
                res.json({result: "failure", result: "Error in saving"});
                return;
            }
            res.json({result: "Successfully update the image"});
        });
      });
    });

    // DELETE the image
    app.delete('/api/image', function(req, res){
      console.log("DELETE : /api/image");
      var owner = req.body.user_name;
      var file_name = req.body.name;

      var savename = "images/" + owner + "_" + file_name;
      fs.unlinkSync(savename, function(err){
        if(err) console.log("NO image file");
      });

      Savedimage.remove({owner : owner, name : file_name}, function(err, output){
        if(err) return res.status(500).json({result: "failure", error: err});
        if(!output) return res.status(404).json({result: "failure", error: 'Image not found'});
        res.json({result: "Successfully delete image"});
      });
    });
}