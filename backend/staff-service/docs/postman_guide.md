# Staff Service API - Postman Guide

## Initial Setup

1. **Download and Install Postman**
   - Download from [postman.com](https://www.postman.com/downloads/)
   - Install and launch the application

2. **Create a Collection**
   - Click "Collections" in the sidebar
   - Click the "+" button to create a new collection
   - Name it "Fitness Center - Staff Service"

3. **Set Collection Variables**
   - Click the collection name
   - Go to the "Variables" tab
   - Add a variable named `baseUrl` with initial and current value: `http://localhost:8002/api/v1`

## Creating Requests

### Health Check Request

1. Click the collection "Fitness Center - Staff Service"
2. Click "Add request"
3. Name it "Health Check"
4. Set the method to `GET`
5. Set the URL to `http://localhost:8002/health`
6. Click "Save"

### Staff Management Requests

#### Get All Staff

1. Click "Add request" in the collection
2. Name it "Get All Staff"
3. Set the method to `GET`
4. Set the URL to `{{baseUrl}}/staff`
5. Click "Save"

#### Get a Specific Staff Member

1. Click "Add request" in the collection
2. Name it "Get Staff by ID"
3. Set the method to `GET`
4. Set the URL to `{{baseUrl}}/staff/:id`
5. Click "Save"
6. When using the request, replace `:id` with an actual staff ID

#### Create a Staff Member

1. Click "Add request" in the collection
2. Name it "Create Staff"
3. Set the method to `POST`
4. Set the URL to `{{baseUrl}}/staff`
5. Go to the "Headers" tab
6. Add a key `Content-Type` with value `application/json`
7. Go to the "Body" tab
8. Select "raw" and choose "JSON" from the dropdown
9. Add this JSON:
   ```json
   {
     "first_name": "John",
     "last_name": "Smith",
     "email": "john.smith@fitness.com",
     "phone": "+1-555-1234",
     "address": "123 Main St, New York, NY",
     "position": "Manager",
     "hire_date": "2020-01-15",
     "salary": 65000.00,
     "status": "Active"
   }
   ```
10. Click "Save"

### Qualification Management Requests

#### Get All Qualifications

1. Click "Add request" in the collection
2. Name it "Get All Qualifications"
3. Set the method to `GET`
4. Set the URL to `{{baseUrl}}/qualifications`
5. Click "Save"

#### Get Staff Qualifications

1. Click "Add request" in the collection
2. Name it "Get Staff Qualifications"
3. Set the method to `GET`
4. Set the URL to `{{baseUrl}}/staff/:id/qualifications`
5. Click "Save"
6. When using the request, replace `:id` with an actual staff ID

#### Create a Qualification

1. Click "Add request" in the collection
2. Name it "Create Qualification"
3. Set the method to `POST`
4. Set the URL to `{{baseUrl}}/qualifications`
5. Go to the "Headers" tab
6. Add a key `Content-Type` with value `application/json`
7. Go to the "Body" tab
8. Select "raw" and choose "JSON" from the dropdown
9. Add this JSON:
   ```json
   {
     "staff_id": 2,
     "qualification_name": "First Aid & CPR",
     "issue_date": "2020-01-10",
     "expiry_date": "2022-01-10",
     "issuing_authority": "American Red Cross"
   }
   ```
10. Click "Save"

### Trainer Management Requests

#### Get All Trainers

1. Click "Add request" in the collection
2. Name it "Get All Trainers"
3. Set the method to `GET`
4. Set the URL to `{{baseUrl}}/trainers`
5. Click "Save"

#### Get Trainers by Specialization

1. Click "Add request" in the collection
2. Name it "Get Trainers by Specialization"
3. Set the method to `GET`
4. Set the URL to `{{baseUrl}}/trainers/specialization/:spec`
5. Click "Save"
6. When using the request, replace `:spec` with an actual specialization (e.g., "Weight Loss")

#### Get Top Rated Trainers

1. Click "Add request" in the collection
2. Name it "Get Top Rated Trainers"
3. Set the method to `GET`
4. Set the URL to `{{baseUrl}}/trainers/top/:limit`
5. Click "Save"
6. When using the request, replace `:limit` with a number (e.g., 3)

#### Create a Trainer

1. Click "Add request" in the collection
2. Name it "Create Trainer"
3. Set the method to `POST`
4. Set the URL to `{{baseUrl}}/trainers`
5. Go to the "Headers" tab
6. Add a key `Content-Type` with value `application/json`
7. Go to the "Body" tab
8. Select "raw" and choose "JSON" from the dropdown
9. Add this JSON:
   ```json
   {
     "staff_id": 2,
     "specialization": "Weight Loss",
     "certification": "NASM Certified Personal Trainer",
     "experience": 5,
     "rating": 4.7
   }
   ```
10. Click "Save"

### Personal Training Requests

#### Get All Training Sessions

1. Click "Add request" in the collection
2. Name it "Get All Training Sessions"
3. Set the method to `GET`
4. Set the URL to `{{baseUrl}}/trainings`
5. Click "Save"

#### Get Training Sessions by Date Range

1. Click "Add request" in the collection
2. Name it "Get Training Sessions by Date"
3. Set the method to `GET`
4. Set the URL to `{{baseUrl}}/trainings/date`
5. Go to the "Params" tab
6. Add a key `start` with value `2023-07-01`
7. Add a key `end` with value `2023-07-31`
8. Click "Save"

#### Schedule a Training Session

1. Click "Add request" in the collection
2. Name it "Schedule Training Session"
3. Set the method to `POST`
4. Set the URL to `{{baseUrl}}/trainings/schedule`
5. Go to the "Headers" tab
6. Add a key `Content-Type` with value `application/json`
7. Go to the "Body" tab
8. Select "raw" and choose "JSON" from the dropdown
9. Add this JSON:
   ```json
   {
     "member_id": 1,
     "trainer_id": 1,
     "session_date": "2023-08-01",
     "start_time": "09:00:00",
     "end_time": "10:00:00",
     "notes": "New client onboarding",
     "price": 75.00
   }
   ```
10. Click "Save"

#### Cancel a Training Session

1. Click "Add request" in the collection
2. Name it "Cancel Training Session"
3. Set the method to `PUT`
4. Set the URL to `{{baseUrl}}/trainings/:id/cancel`
5. Click "Save"
6. When using the request, replace `:id` with an actual training session ID

## Using Path Variables

To create more flexible requests:

1. Edit the "Get Staff by ID" request
2. Change the URL to `{{baseUrl}}/staff/:staffId`
3. Go to the "Path Variables" tab (below the URL field)
4. Add a key `staffId` with the value of the staff ID you want to retrieve
5. Click "Save"

## Organizing with Folders

You can organize your requests by creating folders within your collection:

1. Right-click on the collection
2. Select "Add Folder"
3. Name the folder (e.g., "Staff", "Qualifications", "Trainers", "Personal Training")
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
4. Add a variable named `baseUrl` with the value `http://localhost:8002/api/v1`
5. Create additional environments as needed
6. Switch environments using the dropdown in the top-right corner of Postman
