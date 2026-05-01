 
const asyncHandler = require('express-async-handler')
 
const service = require('../model/serviceModel')
const User = require('../model/userModel') // for update and delete

//https://final-project-ogsv.onrender.com/api
const getservices = asyncHandler(async (req, res) =>{
  
  
    const services = await service.find({}).sort({createdAt: -1})
 
    res.status(200).json(services)
})

// ===== CREATE A service =====
const setservice = asyncHandler(async(req, res) => {

    //add my things
    const { serviceName, monthlyPrice, annualPrice, features, isActive } = req.body
    // Validate that the request body contains a 'text' field 
    //  without this check, we'd save empty/useless services to the database
    if(!name){
        // Set status to 400 (Bad Request) 
        //  tells the client they sent invalid data
        res.status(400)
        // Throw an error with a helpful message 
        //  asyncHandler catches this and passes it to our errorMiddleware
        throw new  Error("Please etner a service. ")
    }


    // Insert a new service document into MongoDB 
    //  .create() both builds and saves the document in one step
    const service_created = await service.create(
        {
            // Set the text field to whatever the client sent in the request body CHECK
            serviceName,
            monthlyPrice,
            annualPrice,
            features,
            isActive,
            addedBy: req.user.username,
            text: req.body.text,
            user: req.user.id // adding which user created the service
            
        }
    )

    // Send back the newly created service as JSON 
    //  the client gets confirmation of what was saved, 
    // including the auto-generated _id
    res.status(200).json(service_created)
})

// ===== UPDATE A service =====
const updateservice =  asyncHandler(async(req, res) => {

    // if we need to update any service - we need an id
    // Look up the service by the id from the URL parameter (e.g., /api/services/abc123) 
    //  we first check if it exists before trying to update
    const service = await service.findById(req.params.id) // this will find our service

    // If no service was found with that id, send a 400 error 
    //  prevents updating a non-existent document
    if(!service){
        res.status(400)
        throw new Error("service not found")
    }

    //-------Only authorized user can update their service---------------
    const user = await User.findById(req.user.id)
    // we want to check if useer exist or not, if yes then they can only update and delete their services
    if(!user){
        res.status(401)
        throw new Error(' user not found')
    }

    // Only the services that belong to the user should be modified by that user.
    if (service.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error('User not authorized')
     }

    //--------------------------------------------


    // now lets update the service 
    // Find the service by id and update its text field in one operation
    const updatedservice = await service.findByIdAndUpdate(
        req.params.id,          // which service to update
        {text: req.body.text},  // the new data to apply
        {new: true}             // return the updated document instead of the old one 
        //  without this, Mongoose returns the document as it was BEFORE the update
    )

    // Send back the updated service so the client can see the changes took effect
    res.status(200).json(updatedservice)
})

// ===== DELETE A service =====
const deleteservice = asyncHandler(async (req, res) => {

    // Find the service first 
    //  we need the document object to call .deleteOne() on it
    const service = await service.findById(req.params.id) // this will find our service

    // If the service doesn't exist, tell the client 
    //  prevents trying to delete something that's already gone
    if(!service){
        res.status(400)
        throw new Error("service not found")
    }


    //-------Only authorized user can update their service ---------------
    const user = await User.findById(req.user.id)
    // we want to check if useer exist or not, if yes then they can only update and delete their services
    if(!user){
        res.status(401)
        throw new Error(' user not found')
    }

    // check if the service has the user field, because we are adding the user key in the database
    if (service.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error('User not authorized')
     }

    //--------------------------------

    // Remove the service from the database 
    //  .deleteOne() is called on the document instance we found above
    await service.deleteOne()

    // Send back a confirmation message with the deleted service's id 
    //  lets the client know which service was removed
    res.status(200).json({ message: `Delete service ${req.params.id}` })
}
)

// Export all four functions so serviceRoutes.js can attach them to the corresponding HTTP endpoints
module.exports = {
    getservices,
    setservice,
    updateservice,
    deleteservice
}