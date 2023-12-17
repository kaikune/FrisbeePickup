import {dbConnection, closeConnection} from './config/mongoConnection.js';
import { usersData, gamesData, groupsData } from "./data/index.js";

export async function seed(){
    const userData = [
        ["jdoe123", "jdoe123@example.com", "P@ssw0rd"],
        ["alex90", "alex90@mail.com", "Alex@123"],
        ["sam_5", "sam_5@domain.com", "1aS$word"],
        ["kellyC", "kellyC@email.com", "Ke11y#C7"],
        ["brian8", "brian8@web.com", "Br1an$88"],
        ["laraT2", "laraT2@site.com", "L@raT234"],
        ["tommyJ", "tommyJ@mail.net", "T0mmyJ!11"],
        ["ninaP3", "ninaP3@example.org", "NinaP#3!"],
        ["dave01", "dave01@internet.com", "D@v2e0101"],
        ["elleZ", "elleZ@online.com", "Elle23Z@12"],
        ["ronM", "ronM@mailservice.com", "Ron3M#987"],
        ["ivy45", "ivy45@contact.com", "Ivy$234567"],
        ["zoeQ", "zoeQ@network.com", "Z0eQ!23234"],
        ["max22", "max22@hub.com", "Max@223211"],
        ["liz9", "liz9@connect.com", "Liz239$876"],
        ["kateB", "kateB@talk.com", "KateB#01"],
        ["ian5", "ian5@message.com", "1anF2ive!"],
        ["ginaL", "ginaL@inbox.com", "Gina23L#5!"],
        ["seth3", "seth3@post.com", "Seth#2333"],
        ["amyR", "amyR@comms.com", "AmyR@789"],
        ["user21", "user21@email.com", "Us21@er!"],
        ["johnDoe", "johnDoe@mail.net", "John@123"],
        ["annaB", "annaB@web.com", "AnnaB$4!"],
        ["markZ4", "markZ4@site.org", "MarkZ@42"],
        ["lucyL", "lucyL@domain.com", "Lucy#123"],
        ["steveJobs", "steveJobs@apple.com", "SteveJ1!"],
        ["billG", "billG@microsoft.com", "BillG@123"],
        ["elonM", "elonM@tesla.com", "ElonM$3!"],
        ["jeffB", "jeffB@amazon.com", "JeffB42!"],
        ["timC", "timC@apple.com", "TimC@789"],
        ["user31", "user31@example.com", "U3!serpw"],
        ["chris12", "chris12@mail.com", "Ch12!ris"],
        ["sara7", "sara7@web.com", "S@ra7pwd"],
        ["leoX", "leoX@domain.net", "X!eoL789"],
        ["mikeY", "mikeY@site.org", "MiY@ke00"],
        ["luna21", "luna21@internet.com", "L21una!#"],
        ["bobK", "bobK@online.com", "B0bK!234"],
        ["zoeS", "zoeS@connect.com", "Zoe@S123"],
        ["jayM", "jayM@network.com", "JayM!#45"],
        ["lilyB", "lilyB@mailservice.com", "Lily@B12"],
        ["tomH", "tomH@contact.com", "TomH#456"],
        ["jackO", "jackO@message.com", "Ja@ckO12"],
        ["emmaW", "emmaW@inbox.com", "Emm@W321"],
        ["noahC", "noahC@post.com", "No1ah!C4"],
        ["avaL", "avaL@comms.com", "Ava3L@789"],
        ["masonD", "masonD@hub.com", "Mas30n!D"],
        ["sophiaN", "sophiaN@talk.com", "S3oph!aN2"],
        ["loganT", "loganT@apple.com", "Log3anT@1"],
        ["ameliaR", "ameliaR@site.com", "Ame3li@R3"],
        ["oliverP", "oliverP@domain.com", "Ol3i@verP"]
    ];
    const userPromises = userData.map(user => usersData.createUser(user[0], user[1], user[2]));
    await Promise.all(userPromises);

    const allUsers = await usersData.getAllUsers();

    const group1 = await groupsData.create("Frisbee Enthusiasts Group", "A community for all Frisbee lovers", allUsers[0]._id);
    const group2 = await groupsData.create("Ultimate Frisbee Competitors", "Focused on competitive ultimate Frisbee games and tournaments", allUsers[1]._id);
    const group3 = await groupsData.create("Frisbee Skills Workshop", "Workshops and training sessions to improve Frisbee skills", allUsers[2]._id);
    const group4 = await groupsData.create("Youth Frisbee Club", "Engaging youth in Frisbee activities and games", allUsers[3]._id);
    const group5 = await groupsData.create("Casual Frisbee Meetups", "Casual and fun Frisbee meetups for all skill levels", allUsers[4]._id);

    const game1 = await gamesData.create("Sunset Frisbee Fun", "Relaxed Frisbee game at sunset", { streetAddress: "101 Beach Blvd", city: "Santa Monica", state: "CA", zip: "90401" }, 15, "12/12/2024", "5:00 PM", "7:00 PM", group1._id, allUsers[0]._id);
    const game2 = await gamesData.create("Morning Frisbee in the Park", "Start your day with a fun Frisbee game", { streetAddress: "500 Park Ave", city: "New York", state: "NY", zip: "10001" }, 20, "12/20/2024", "8:00 AM", "10:00 AM", group1._id,allUsers[0]._id);

    const game3 = await gamesData.create("Ultimate Frisbee Showdown", "Competitive ultimate Frisbee match", { streetAddress: "123 Sunshine Ave", city: "Miami", state: "FL", zip: "33101" }, 20, "12/10/2024", "10:00 AM", "1:00 PM", group2._id,allUsers[1]._id);
    const game4 = await gamesData.create("Frisbee Champions League", "High-level ultimate Frisbee game", { streetAddress: "200 Sports Way", city: "Chicago", state: "IL", zip: "60601" }, 22, "12/15/2024", "3:00 PM", "6:00 PM", group2._id,allUsers[1]._id);

    const game5 = await  gamesData.create("Frisbee Skills Bootcamp", "Intensive skill-building session for serious players", { streetAddress: "750 Field Rd", city: "Austin", state: "TX", zip: "78701" }, 25, "01/05/2025", "9:00 AM", "12:00 PM",group3._id,allUsers[2]._id);
    const game6 = await gamesData.create("Throw and Catch Workshop", "Learn advanced throwing and catching techniques", { streetAddress: "320 Green Park", city: "Denver", state: "CO", zip: "80014" }, 30, "01/19/2025", "2:00 PM", "4:00 PM", group3._id,allUsers[2]._id);

    const game7 = await gamesData.create("Junior Frisbee Tournament", "Friendly tournament for young Frisbee enthusiasts", { streetAddress: "980 Youth Ave", city: "San Francisco", state: "CA", zip: "94102" }, 16, "02/10/2025", "10:00 AM", "12:00 PM", group4._id,allUsers[3]._id);
    const game8 = await gamesData.create("Youth Frisbee Fun Day", "A day full of Frisbee games and activities for youngsters", { streetAddress: "400 Kids Park Rd", city: "Portland", state: "OR", zip: "97209" }, 18, "02/24/2025", "11:00 AM", "2:00 PM", group4._id,allUsers[3]._id);

    const game9 = await gamesData.create("Beach Frisbee Gathering", "Casual Frisbee play on the beach", { streetAddress: "220 Ocean View Blvd", city: "Los Angeles", state: "CA", zip: "90012" }, 12, "03/05/2025", "3:00 PM", "5:00 PM", group5._id,allUsers[4]._id);
    const game10 = await gamesData.create("Park Frisbee Meetup", "Relaxed Frisbee game at the city park", { streetAddress: "555 Central Park", city: "New York", state: "NY", zip: "10001" }, 15, "03/18/2025", "4:00 PM", "6:00 PM", group5._id,allUsers[4]._id);

    const allGroups = [group1, group2, group3, group4, group5];
    const allGames = [game1,game2,game3,game4,game5,game6,game7,game8,game9,game10];
    
    for(let i = 5; i<userData.length; i++){
        if(i % 5 === 0){
            await groupsData.addUser(allUsers[i]._id,group1._id);
            await gamesData.addUser(allUsers[i]._id,game1._id);
            await gamesData.addUser(allUsers[i]._id,game2._id);
        }else if(i % 5 === 1){
            await groupsData.addUser(allUsers[i]._id,group2._id);
            await gamesData.addUser(allUsers[i]._id,game3._id);
            await gamesData.addUser(allUsers[i]._id,game4._id);
        }
        else if(i % 5 === 2){
            await groupsData.addUser(allUsers[i]._id,group3._id);
            await gamesData.addUser(allUsers[i]._id,game5._id);
            await gamesData.addUser(allUsers[i]._id,game6._id);
        }
        else if(i % 5 === 3){
            await groupsData.addUser(allUsers[i]._id,group4._id);
            await gamesData.addUser(allUsers[i]._id,game7._id);
            await gamesData.addUser(allUsers[i]._id,game8._id);
        }
        else if(i % 5 === 4){
            await groupsData.addUser(allUsers[i]._id,group5._id);
            await gamesData.addUser(allUsers[i]._id,game9._id);
            await gamesData.addUser(allUsers[i]._id,game10._id);
        }
    }

    console.log("Done inserting all data.");


}

const db = await dbConnection();
console.log("Connected")
await db.dropDatabase(); //Clears database before insert
console.log("Database cleared")
await seed();
console.log("Seed data entered")
await closeConnection();
console.log("finished")