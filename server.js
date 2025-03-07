const express=require('express')
const {open}=require('sqlite')
const sqlite3=require('sqlite3')
const cors=require('cors')
const jwt=require('jsonwebtoken')
const app=express()
const bcrypt=require('bcryptjs')
const path=require('path')

app.use(express.json())


const dbPath=path.join(__dirname,'apsrtc.db')

let db=null

app.use(cors(
    {
        origin:'http://localhost:3000',
        methods:['GET','POST','PUT','DELETE'],
        allowedHeaders:['Content-Type']
    }
))



const initiateAndStartDatabaseServer=async()=>{
    try{
        db=await open({
            filename:dbPath,
            driver:sqlite3.Database
        })
        app.listen(4000,()=>{
            console.log('server is running at http://localhost:3000/')
        })
    }
    catch(e){
        console.log(`Db Error,${e.message}`)
        process.exit(1)
    }
}


initiateAndStartDatabaseServer()


app.post('/register', async (req, res) => {
    try {
        const { fullName, mobileNumber, username, email, password, address, pincode } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Corrected SQL query with 7 placeholders
        const insertQuery = `INSERT INTO users (full_name, mobile_number, username, email, password, address, pin_code) VALUES (?, ?, ?, ?, ?, ?, ?)`;

        // Corrected order of values
        await db.run(insertQuery, [fullName, mobileNumber, username, email, hashedPassword, address, pincode]);

        res.status(201).json({ message: 'User Registered Successfully' });
    } catch (e) {
        console.error('Error while inserting:', e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userQuery = `SELECT * FROM users WHERE username = ?`;
        const dbUser = await db.get(userQuery, [username]);

        if (!dbUser) {
            return res.status(401).json({ error: 'Invalid Username or Password' });
        }

        const { user_id } = dbUser; // Fix destructuring

        const isPasswordMatched = await bcrypt.compare(password, dbUser.password);

        if (isPasswordMatched) {
            const payload = { username: username };
            const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
            
            return res.status(200).json({ jwtToken, userId: user_id }); // Correct case
        } else {
            return res.status(401).json({ error: 'Invalid Username or Password' });
        }
    } catch (e) {
        console.error('Error during login:', e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




app.get('/users', async (req, res) => {
    try {
        const usersQuery = `SELECT * FROM users;`;
        const users = await db.all(usersQuery); // Changed variable name for clarity

        res.status(200).json({ users }); // Corrected status code and response format
    } catch (e) {
        console.error(`Error while fetching users: ${e.message}`);
        res.status(500).json({ error: 'Internal Server Error' }); // Fixed JSON format
    }
});



app.delete('/deleteusers', async (req, res) => {
    try {
        const deleteQuery = `DELETE FROM users;`;
        await db.run(deleteQuery);

        res.status(200).json({ message: 'All users deleted successfully' });
    } catch (e) {
        console.error('Error while deleting:', e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




app.get('/employees', async (req, res) => {
    try {
        const employeesQuery = `SELECT * FROM employee;`;
        const employees = await db.all(employeesQuery); // Changed variable name for clarity

        res.status(200).json({ employees }); // Corrected status code and response format
    } catch (e) {
        console.error(`Error while fetching users: ${e.message}`);
        res.status(500).json({ error: 'Internal Server Error' }); // Fixed JSON format
    }
});