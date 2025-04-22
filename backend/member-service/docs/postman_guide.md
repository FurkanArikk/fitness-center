# Member Service API - Postman Guide

## Initial Setup

1. **Download and Install Postman**
   - Download from [postman.com](https://www.postman.com/downloads/)
   - Install and launch the application

2. **Create a Collection**
   - Click "Collections" in the sidebar
   - Click the "+" button to create a new collection
   - Name it "Fitness Center - Member Service"

3. **Set Collection Variables**
   - Click the collection name
   - Go to the "Variables" tab
   - Add a variable named `baseUrl` with initial and current value: `http://localhost:8001/api/v1`

## Creating Requests

### Health Check Request

1. Click the collection "Fitness Center - Member Service"
2. Click "Add request"
3. Name it "Health Check"
4. Set the method to `GET`
5. Set the URL to `http://localhost:8001/health`
6. Click "Save"

### Get All Memberships

1. Click "Add request" in the collection
2. Name it "Get All Memberships"
3. Set the method to `GET`
4. Set the URL to `{{baseUrl}}/memberships`
5. Click "Save"

### Get Active Memberships Only

1. Click "Add request" in the collection
2. Name it "Get Active Memberships"
3. Set the method to `GET`
4. Set the URL to `{{baseUrl}}/memberships`
5. Go to the "Params" tab
6. Add a key `active` with value `true`
7. Click "Save"

### Create a Membership

1. Click "Add request" in the collection
2. Name it "Create Membership"
3. Set the method to `POST`
4. Set the URL to `{{baseUrl}}/memberships`
5. Go to the "Headers" tab
6. Add a key `Content-Type` with value `application/json`
7. Go to the "Body" tab
8. Select "raw" and choose "JSON" from the dropdown
9. Add this JSON:
   ```json
   {
     "membershipName": "Weekend Warrior",
     "description": "Access on weekends only",
     "duration": 1,
     "price": 19.99,
     "isActive": true
   }
   ```
10. Click "Save"

### Get a Specific Membership

1. Click "Add request" in the collection
2. Name it "Get Membership by ID"
3. Set the method to `GET`
4. Set the URL to `{{baseUrl}}/memberships/:id`
5. Click "Save"
6. When using the request, replace `:id` with an actual membership ID

### Update a Membership

1. Click "Add request" in the collection
2. Name it "Update Membership"
3. Set the method to `PUT`
4. Set the URL to `{{baseUrl}}/memberships/:id`
5. Go to the "Headers" tab
6. Add a key `Content-Type` with value `application/json`
7. Go to the "Body" tab
8. Select "raw" and choose "JSON" from the dropdown
9. Add this JSON:
   ```json
   {
     "membershipName": "Weekend Warrior Plus",
     "description": "Enhanced weekend access",
     "duration": 1,
     "price": 24.99,
     "isActive": true
   }
   ```
10. Click "Save"
11. When using the request, replace `:id` with an actual membership ID

### Delete a Membership

1. Click "Add request" in the collection
2. Name it "Delete Membership"
3. Set the method to `DELETE`
4. Set the URL to `{{baseUrl}}/memberships/:id`
5. Click "Save"
6. When using the request, replace `:id` with an actual membership ID

### Get Member Information

1. Click "Add request" in the collection
2. Name it "Get Member by ID"
3. Set the method to `GET`
4. Set the URL to `{{baseUrl}}/members/:id`
5. Click "Save"
6. When using the request, replace `:id` with an actual member ID

### Create a Member

1. Click "Add request" in the collection
2. Name it "Create Member"
3. Set the method to `POST`
4. Set the URL to `{{baseUrl}}/members`
5. Go to the "Headers" tab
6. Add a key `Content-Type` with value `application/json`
7. Go to the "Body" tab
8. Select "raw" and choose "JSON" from the dropdown
9. Add this JSON:
   ```json
   {
     "firstName": "John",
     "lastName": "Doe",
     "email": "john.doe@example.com",
     "phone": "555-123-4567",
     "address": "123 Main St",
     "dateOfBirth": "1990-01-15T00:00:00Z",
     "emergencyContactName": "Jane Doe",
     "emergencyContactPhone": "555-987-6543"
   }
   ```
10. Click "Save"

### Create a Fitness Assessment

1. Click "Add request" in the collection
2. Name it "Create Assessment"
3. Set the method to `POST`
4. Set the URL to `{{baseUrl}}/assessments`
5. Go to the "Headers" tab
6. Add a key `Content-Type` with value `application/json`
7. Go to the "Body" tab
8. Select "raw" and choose "JSON" from the dropdown
9. Add this JSON:
   ```json
   {
     "memberId": 1,
     "trainerId": 2,
     "assessmentDate": "2023-07-15T10:00:00Z",
     "height": 175,
     "weight": 78.5,
     "bodyFatPercentage": 17.0,
     "bmi": 25.6,
     "notes": "Monthly checkup",
     "goalsSet": "Maintain current fitness level",
     "nextAssessmentDate": "2023-08-15T10:00:00Z"
   }
   ```
10. Click "Save"

## Using Path Variables

To create more flexible requests:

1. Edit the "Get Member by ID" request
2. Change the URL to `{{baseUrl}}/members/:memberId`
3. Go to the "Path Variables" tab (below the URL field)
4. Add a key `memberId` with the value of the member ID you want to retrieve
5. Click "Save"

## Organizing with Folders

You can organize your requests by creating folders within your collection:

1. Right-click on the collection
2. Select "Add Folder"
3. Name the folder (e.g., "Members", "Memberships", "Assessments")
4. Drag and drop relevant requests into each folder

## Running Multiple Requests

You can run multiple requests in sequence:

1. Right-click on the collection or folder
2. Select "Run collection" or "Run folder"
3. Configure the run settings
4. Click "Run"

## Exporting and Sharing

To export your collection for sharing with teammates:

1. Click the "..." (more actions) button next to your collection
2. Select "Export"
3. Choose the desired format (usually Collection v2.1)
4. Save the file
5. Share with your team members who can import it into their Postman

## Advanced: Environment Variables

To work with different environments (development, staging, production):

1. Click "Environments" in the sidebar
2. Click the "+" button to create a new environment
3. Name it "Development"
4. Add a variable named `baseUrl` with the value `http://localhost:8001/api/v1`
5. Create additional environments as needed
6. Switch environments using the dropdown in the top-right corner of Postman
