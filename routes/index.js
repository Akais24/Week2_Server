// routes/index.js

module.exports = function(app, fs, User, Savedimage, Contact)
{


  // GET user
  app.get('/api/id/:id', function(req, res){
    console.log("GET : /api/id/:id");
    var id = req.params.id;
    User.findOne({unique_id: id}, function(err, user){
      console.log(id);
        if(err) return res.status(500).json({error: err});
        if(!user) return res.json({result : "Failure"});
        res.json({result: "Success", content: user.alias, alias : user.alias, point: user.point, profile: user.isprofile});
    })
  });

  // GET user
  app.get('/api/user/:user_name', function(req, res){
    console.log("GET : /api/user/:user_name");
    User.findOne({alias: req.params.user_name}, function(err, user){
        if(err) return res.status(500).json({error: err});
        if(!user) return res.status(404).json({result : "Failure"});
        res.json({result: "Success"});
    })
  });

  // CREATE user
  app.post('/api/user/:user_name', function(req, res){
    console.log("POST : /api/user/:user_name");
    console.log(req.body);
    var user = new User();
    user.alias = req.params.user_name;
    console.log(user.alias);
    user.unique_id = req.body.fbid;
    console.log(user.unique_id);
    user.published_date = new Date().getTime();
    user.point = 0;
    user.isprofile = 0;

    user.save(function(err){
        if(err){
            console.error(err);
            res.json({result: "Failure"});
            return;
        }
        res.json({result: "Success"});
    });
  });

  // GET contact lists
  app.get('/api/contacts/:user_name', function(req, res){
    console.log("GET : /api/contacts/:user_name");
      User.findOne({alias: req.params.user_name}, function(err, user){
          if(err) return res.status(500).json({error: err});
          if(!user) return res.status(404).json({error: 'user not found'});

          Contact.find({owner : req.params.user_name}, function(err, contact){
            res.json(contact);
          }
        )
      })
  });

  // UPDATE contact lists
  app.put('/api/contacts/:user_name', function(req, res){
    console.log("PUT : /api/contacts/:user_name");
      console.log(req.body);
    var raw_owner = req.params.user_name;
    User.findOne({alias: raw_owner}, function(err, user){
        if(err){
          console.log(err);
          return res.status(500).json({ error: 'database failure' });
        }
        if(!user) return res.status(404).json({ error: 'user not found' });

        console.log(req.body.contacts);

        var contact_jsons = JSON.parse(req.body.contacts);

        var i = 0;
        var new_count = 0;
        var m_count = 0;

        function recurse(n, m){
          var new_count = n;
          var m_count = m;
          if(i < contact_jsons.length){
            var raw_name = contact_jsons[i].name;
            var raw_number = contact_jsons[i].number;
            var raw_email = contact_jsons[i].email;

            Contact.findOne({owner: raw_owner, name : raw_name}, function(err, contact){
              if(err){
                return;
              }
              if(!contact){
                var cont = new Contact();
                cont.owner = req.params.user_name;
                cont.name = raw_name;
                cont.number = raw_number;
                cont.email = raw_email;
                //   console.log("Make Newone");
                // console.log("owner : " + cont.owner);
                // console.log("name : " + cont.name);
                // console.log("number : " + cont.number);
                // console.log("email : " + cont.email);

                cont.save(function(err){
                    if(err){
                        console.error(err);
                        res.json({result: 0});
                        return;
                    }
                });
                new_count++;
              }else{
                //console.log(raw_name + " of " + raw_owner + " is already exist!");
                contact.number = raw_number;
                //console.log("number(m) : " + contact.number);
                contact.email = raw_email;
                //console.log("email(m) : " + contact.email);

                contact.save(function(err){
                    if(err){
                        console.error(err);
                        res.json({result: 0});
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
          return res.status(500).json({ error: 'database failure' });
        }
        if(!user) return res.status(404).json({ error: 'user not found' });

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
      if(err) return res.status(500).json({error: err});
      if(!savedimage) return res.status(404).json({error: 'Image not found'});

      res.json(savedimage);
    });
  });

  // GET image
  app.get('/api/image/:user_name/:file_name', function(req, res){
    console.log("GET : /api/image");
    var owner = req.params.user_name;
    var file_name = req.params.file_name;
    Savedimage.findOne({owner : owner, name : file_name}, function(err, savedimage){
      if(err) return res.status(500).json({error: err});
      if(!savedimage) return res.status(404).json({error: 'Image not found'});

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
      if(err) return res.status(500).json({error: err});
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
          res.json({result: "Error in converting"});
          return;
        }
      });

      savedimage.save(function(err){
          if(err){
              console.error(err);
              res.json({result: "Error in saving"});
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
      if(err) return res.status(500).json({error: err});
      if(!output) return res.status(404).json({error: 'Image not found'});
      res.json({result: "Successfully delete image"});
    });
  });


  // UPDATE ranking
  app.put('/api/ranking/:user_name', function(req, res){
    console.log("PUT : /api/ranking/:user_name");
    var raw_owner = req.params.user_name;
    User.findOne({alias: raw_owner}, function(err, user){
        if(err){
          console.log(err);
          return res.status(500).json({ error: 'database failure' });
        }
        if(!user) return res.status(404).json({ error: 'user not found' });

        var count = req.body.point;
        user.point = count;
        console.log(count);

        user.save(function(err){
            if(err){
                console.error(err);
                res.json({result: "Failure"});
                return;
            }
            res.json({result: "Success"});
        });
    });
  });

  // GET ranking
  app.get('/api/ranking', function(req, res){
    console.log("GET : /api/ranking");
    var mysort = {point: -1};
    User.find().sort("point").limit(3).exec(function(err, result) {
      if(err) return res.status(500).json({ error: 'database failure' });

      var array = [];
      var stuff = Math.min(result.length, 3);
      for(var i=0; i<stuff; i++){
        var target= result[stuff-i-1];
        array.push({alias: target.alias, point: target.point})
      }
      console.log(array);
      res.json(array);
    });
  });



  // GET profile image
  app.get('/api/profile/:user_name', function(req, res){
    console.log("GET : /api/profile/:user_name");
    var owner = req.params.user_name;
    User.findOne({alias : owner}, function(err, user){
      if(err) return res.status(500).json({error: err});
      if(!user) return res.status(404).json({error: 'User not found'});

      var savename = "profile/" + owner + "_profile.jpg";
      console.log(savename);

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
      res.json({data : base64str});
    });
  });

  // PUT profile image
  app.put('/api/profile/:user_name', function(req, res){
    console.log("PUT : /api/profile/:user_name");
    var owner = req.params.user_name;
    var file_name = "profile.jpg";
    User.findOne({alias : owner}, function(err, user){
      if(err) return res.status(500).json({error: err});

      user.isprofile = 1;

      var savename = "profile/" + owner + "_" + file_name;
      fs.writeFile(savename, req.body.data, 'base64', function(err) {
        if(err){
          console.log("error", err);
          res.json({result: "Failure"});
          return;
        }
      });

      user.save(function(err){
          if(err){
              console.error(err);
              res.json({result: "Failure"});
              return;
          }
      });
      res.json({result: "Success"});
    });
  });



}
