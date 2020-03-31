const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Story = mongoose.model('stories');
const GoogleUser = mongoose.model('google_users');

const { ensureAuthenticated, ensureGuest } = require('../helpers/auth');

// Stories index
router.get('/', (req, res) => {
  Story.find({ status: 'public' })
    .populate('user')
    .sort({ date: 'desc' })
    .then(stories => {
      res.render('stories/index', { stories: stories });
    });
});

// Show Single Story
router.get('/show/:id', (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
    .populate('user')
    .populate('comments.commentUser')
    .then(story => {
      if (story.status == 'public') {
        res.render('stories/show', {
          story: story
        });
      } else {
        if (req.user) {
          if (req.user.id == story.user._id) {
            res.render('stories/show', {
              story: story
            });
          } else {
            res.redirect('/stories');
          }
        } else {
          res.redirect('/stories');
        }
      }
    });
});

// List stories from specific user
router.get('/user/:userId', (req, res) => {
  Story.find({ user: req.params.userId, status: 'public' })
    .populate('user')
    .then(stories => {
      res.render('stories/index', {
        stories
      });
    });
});

//Logged in users story
router.get('/my', ensureAuthenticated, (req, res) => {
  Story.find({ user: req.user.id })
    .populate('user')
    .then(stories => {
      res.render('stories/index', {
        stories
      });
    });
});

// Add story form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('stories/add');
});

// Edit story form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Story.findOne({
    _id: req.params.id
  }).then(story => {
    if (story.user != req.user.id) {
      res.redirect('/stories');
    } else {
      res.render('stories/edit', {
        story: story
      });
    }
  });
});

// Process Add Story
router.post('/', ensureAuthenticated, (req, res) => {
  let allowComments;
  // allowComments is set 'on' by html if checked
  // and "" if not checked
  if (req.body.allowComments) {
    allowComments = true;
  } else {
    allowComments = false;
  }

  const newStory = {
    title: req.body.title,
    body: req.body.body,
    status: req.body.status,
    allowComments: allowComments,
    user: req.user.id
  };

  // Create Story
  new Story(newStory).save().then(story => {
    res.redirect(`/stories/show/${story.id}`);
  });
});

// Process Edit Story
router.put('/:id', (req, res) => {
  Story.findOne({
    _id: req.params.id
  }).then(story => {
    // Check allow comments (checkbox)
    let allowComments;
    if (req.body.allowComments) {
      allowComments = true;
    } else {
      allowComments = false;
    }

    // Set new values
    story.title = req.body.title;
    story.body = req.body.body;
    story.status = req.body.status;
    story.allowComments = allowComments;

    // Save to db
    story.save().then(story => {
      res.redirect('/dashboard');
    });
  });
});

// Delete story
router.delete('/:id', (req, res) => {
  Story.deleteOne({ _id: req.params.id }).then(() => {
    res.redirect('/dashboard');
  });
});

// Add comment
router.post('/comment/:id', (req, res) => {
  Story.findOne({
    _id: req.params.id
  }).then(story => {
    const newComment = {
      commentBody: req.body.commentBody,
      commentUser: req.user.id
    };
    //Add to comment array
    story.comments.unshift(newComment);

    // Save back to db
    story.save().then(story => {
      res.redirect(`/stories/show/${story.id}`);
    });
  });
});

module.exports = router;
