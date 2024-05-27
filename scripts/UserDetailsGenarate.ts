import { fa, faker } from "@faker-js/faker";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "src/app.module";
import SignUpDto from "src/user/dto/signUp.dto";
import UserService from "src/user/user.service";

async function UserDetailsGenarate(){
    const app =await NestFactory.createApplicationContext(AppModule);
    const userServices=app.get(UserService);
    const users:SignUpDto[]=[];
    for(let i=0; i<50; i++){
        const signUpDto:SignUpDto={
            type:"USER",
            status:"ONBOARD",
            fcmToken:"",
            basic_info:{
                first_name:faker.person.firstName(),
                last_name:faker.person.lastName(),
                dob:faker.date.birthdate(),
                gender:faker.helpers.arrayElement(["MALE","FEMALE"])
            },
            contact_info:{
                email:faker.internet.email(),
                mobile_number:[
                    faker.string.numeric(12),
                    faker.string.numeric(12),
                    faker.string.numeric(12),
                ].slice(0,Math.floor(Math.random()*3)+1) //generate 3 numbers
            },
            auth_info:{
                password:faker.internet.password()
            }
        };
        users.push(signUpDto);
    };
    await userServices.createUsers(users);
    console.log("50 users created successfully.");
    app.close();
}
UserDetailsGenarate();