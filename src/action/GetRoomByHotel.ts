"use server"
import { db } from "@/app/lib/db";
export async function FindRoomByHotel(hotelId: number) {
 try{
   const data= await db.roomTypes.findMany({
    where:{
        hotel_id: hotelId,
    }
   });
   return data;
 }
 catch(e)
 {
  throw new Error("Failed to fetch room types for the hotel");
 }
    
}