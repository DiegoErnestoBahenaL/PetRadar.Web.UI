export * from './login.service';
import { LoginService } from './login.service';
export * from './userPets.service';
import { UserPetsService } from './userPets.service';
export * from './users.service';
import { UsersService } from './users.service';
export * from './veterinaryAppointments.service';
import { VeterinaryAppointmentsService } from './veterinaryAppointments.service';
export const APIS = [LoginService, UserPetsService, UsersService, VeterinaryAppointmentsService];
