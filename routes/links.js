const express = require('express');
const qr = require('qrcode');
const Link = require('../models/link');

const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    console.log("in /dashboeard get");
    const userId = req.session.userId;
   // console.log(userId);
    if (userId) {
      const links = await Link.find({ userId });
      res.render('dashboard.ejs', { links: links, message: "welcome" });
    }
    else {
      res.redirect('/signin');
    }
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
});

router.get('/delete', async (req, res) => {
  try {
    const userId = req.session.userId;
    const linkId = req.query.id;
   // console.log(userId, linkId);
    const linkToDelete = await Link.findOne({ _id: linkId, userId });
    if (!linkToDelete) {
      return res.status(404).send('Link not found');
    }

    if (userId && linkId) {
      await Link.findByIdAndDelete(linkId);

    }

    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.redirect('/dashboard'); // Redirect back to the dashboard in case of an error
  }
});

// New route for handling the edit form display
router.get('/edit', async (req, res) => {
  try {
    const userId = req.session.userId;
    const linkId = req.query.id;

    // Fetch the link details for pre-populating the edit form
    const linkToEdit = await Link.findOne({ _id: linkId, userId });

    if (!linkToEdit) {
      return res.status(404).send('Link not found');
    }

    res.render('edit.ejs', { link: linkToEdit, message: "" });
  } catch (error) {
    console.error(error);
    res.redirect('/dashboard');
  }
});

// Route for handling the submission of the edit form
router.post('/edit', async (req, res) => {
  try {
    const userId = req.session.userId;
    const linkId = req.query.id;

    // Validate that the user owns the link before editing
    const linkToEdit = await Link.findOne({ _id: linkId, userId });

    if (!linkToEdit) {
      return res.status(404).send('Link not found');
    }
    const qrCode = req.body.name;
    const shortUrl = `${req.protocol}://${req.get('host')}/${userId}/${qrCode}`;
    await qr.toFile(`./public/qrcode/${qrCode}.png`, shortUrl);
    //console.log("short url is ", shortUrl);
    // Update link details based on the form submission
    linkToEdit.url = req.body.url;
    linkToEdit.name = req.body.name;
    await linkToEdit.save();

    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.redirect('/dashboard');
  }
});

router.get('/createQR', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (userId) {
      res.render('home', { links: [], message: "" });
    }
    else {
      res.redirect('/signin');

    }
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
})

router.post('/createQR', async (req, res) => {
  try {
    const userId = req.session.userId;
    //console.log("userid=", userId);

    const { name, url } = req.body;
    // const links = await Link.find({ userId });

    // Check if the name is unique for the user
    const existingLinkByName = await Link.findOne({ userId, name }).select('name');
    // console.log(existingLinkByName);
    const linksArray = Array.isArray(existingLinkByName) ? existingLinkByName : [existingLinkByName];

    if (existingLinkByName) {
      return res.render('home.ejs', { links: linksArray, message: 'Name already exists' });
    }

    // Check if the URL is unique for the user
    const existingLinkByUrl = await Link.findOne({ userId, url }).select('name');
    const linksArray2 = Array.isArray(existingLinkByUrl) ? existingLinkByUrl : [existingLinkByUrl];

    if (existingLinkByUrl) {
      return res.render('home.ejs', { links: linksArray2, message: 'URL already exists' });
    }
    // Generate QR code
    const qrCode = name;
    const shortUrl = `${req.protocol}://${req.get('host')}/${userId}/${name}`;
    await qr.toFile(`./public/qrcode/${qrCode}.png`, shortUrl);
    //console.log("short url is ", shortUrl);
    //Save link to the database
    const link = new Link({ userId, name, url, shortUrl });
    await link.save();
    const Alllink = await Link.find({ userId: userId, name: name }).select('name');
    const linksArray3 = Array.isArray(Alllink) ? Alllink : [Alllink];

    res.render('home.ejs', { links: linksArray3, message: 'Link saved successfully' });
  } catch (error) {
    console.error(error);
    res.redirect('/dashboard');
  }
});

router.post('/createShort', async (req, res) => {
  try {
    const userId = req.session.userId;
    //console.log("userid=", userId);

    const { name, url } = req.body;
    const existingLinkByName = await Link.findOne({ userId, name }).select('shortUrl');
    console.log(existingLinkByName);
    const linksArray = Array.isArray(existingLinkByName) ? existingLinkByName : [existingLinkByName];

    if (existingLinkByName) {
      return res.render('home.ejs', { links: linksArray, message: 'Name already exists' });
    }

    // Check if the URL is unique for the user
    const existingLinkByUrl = await Link.findOne({ userId, url }).select('shortUrl');
    const linksArray2 = Array.isArray(existingLinkByUrl) ? existingLinkByUrl : [existingLinkByUrl];

    if (existingLinkByUrl) {
      return res.render('home.ejs', { links: linksArray2, message: 'URL already exists' });
    }

    // Generate QR code
    const qrCode = name;
    const shortUrl = `${req.protocol}://${req.get('host')}/${userId}/${name}`;
    await qr.toFile(`./public/qrcode/${qrCode}.png`, shortUrl);
    console.log("short url is ", shortUrl);
    //Save link to the database
    const link = new Link({ userId, name, url, shortUrl });
    await link.save();
    const Alllink = await Link.find({ userId: userId, name: name }).select('shortUrl');
    const linksArray3 = Array.isArray(Alllink) ? Alllink : [Alllink];

    // Render the dashboard with the updated links and success message
    res.render('home.ejs', { links: linksArray3, message: 'Link saved successfully' });
  } catch (error) {
    console.error(error);
    res.redirect('/dashboard');
  }
});
router.post('/create', async (req, res) => {
  try {
    const userId = req.session.userId;
   // console.log("userid=", userId);

    const { name, url } = req.body;
    const links = await Link.find({ userId });

    // Check if the name is unique for the user
    const existingLinkByName = await Link.findOne({ userId, name });
    if (existingLinkByName) {
      return res.render('dashboard.ejs', { links: links, message: 'Name already exists' });
    }

    // Check if the URL is unique for the user
    const existingLinkByUrl = await Link.findOne({ userId, url });
    if (existingLinkByUrl) {
      return res.render('dashboard.ejs', { links: links, message: 'URL already exists' });
    }

    // Generate QR code
    const qrCode = name;
    const shortUrl = `${req.protocol}://${req.get('host')}/${userId}/${name}`;
    await qr.toFile(`./public/qrcode/${qrCode}.png`, shortUrl);
    //console.log("short url is ", shortUrl);
    //Save link to the database
    const link = new Link({ userId, name, url, shortUrl });
    await link.save();
    const Alllink = await Link.find({ userId });

    // Render the dashboard with the updated links and success message
    res.render('dashboard.ejs', { links: Alllink, message: 'Link saved successfully' });
  } catch (error) {
    console.error(error);
    res.redirect('/dashboard');
  }
});
router.get('/:userId/:name', async (req, res) => {
  try {
    const userId = req.params.userId;
    const name = req.params.name;

    // Find the link in the database based on userId and name
    const link = await Link.findOne({ userId, name });

    if (!link) {
      // Handle case where the link is not found
      return res.status(404).send('Link not found');
    }

    // Redirect to the long URL
    res.redirect(link.url);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
module.exports = router;
