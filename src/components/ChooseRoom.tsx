/** @format */
"use client";
import DatePickers from "./DatePicker";
import EachRoom from "./EachRoom";
import CustomSelect from "./Select";
import { Button } from "@nextui-org/react";
import { CameraIcon } from "@/assets/CameraIcon";
import { Input } from "@nextui-org/input";
import { useEffect, useState } from "react";
import CustomSelectHour from "./SelectHour";
import NavigateBack from "@/assets/NavigateBack";
import CustomSelectDay from "./SelectDay";
import { DatePicker } from "@nextui-org/react";
import Swal from "sweetalert2/dist/sweetalert2.js";
import { useRouter } from "next/navigation";
import "sweetalert2/src/sweetalert2.scss";
import { now, today, getLocalTimeZone } from "@internationalized/date";
import { CreditCardOutlined, QrcodeOutlined } from "@ant-design/icons";
import { RadioGroup, Radio } from "@nextui-org/react";
import { CheckAvaRoom } from "@/action/CheckAvaRoom";
import Gallery from "./Gallery";
import {
  formatDateToCustomString,
  formatDateToCustomStringDay,
  formatPrice,
} from "@/func/Format";
interface ImageType {
  original: string;
  thumbnail: string;
}
type CheckInOutType = {
  priceDay: Date;
  priceHour: Date;
  priceNight: Date;
};
const getCurrentHour = () => {
  const date = new Date();

  const minus = date.getMinutes();
  let hour = date.getHours();
  if (minus < 30) hour = hour + 0.5;
  else hour = hour + 1;
  return hour.toString();
};
const getPriceKey = (typeRental: string) => {
  switch (typeRental) {
    case "priceDay":
      return "priceDay";
    case "priceNight":
      return "priceNight";
    case "priceHour":
      return "priceHour";
    default:
      throw new Error(`Invalid type_rental: ${typeRental}`);
  }
};
interface ReturnListRoom {
  images: ImageType[];
  id: number;
  name: string;
  utilities: string[];
  price: {
    priceDay: number;
    priceNight: number;
    priceHour: number;
  };
}
interface ReturnPrice {
  id: number;
  isAvai: boolean;
  price: number;
}
const ChooseRoom = ({
  listroom,
  name,
  id,
  checkin,
  checkout,
}: {
  listroom: ReturnListRoom[];
  name: string;
  id: string;
  checkin: CheckInOutType;
  checkout: CheckInOutType;
}) => {
  const router = useRouter();
  const onClickHandler = () => {
    Swal.fire({
      icon: "success",
      title: "Đặt phòng thành công",
      text: "Nhân viên chúng tôi sẽ gọi điện để xác nhận",
    }).then(() => {
      router.push("/");
    });
  };
  const [selectedDate, setSelectedDate] = useState(today(getLocalTimeZone()));
  const UpdateTypeHandler = async () => {
    const hours = parseFloat(startHour);
    const fullHours = Math.floor(hours);
    const minutes = (hours - fullHours) * 60;
    console.log(selectedDate.day);
    const date = new Date(
      selectedDate.year,
      selectedDate.month - 1,
      selectedDate.day,
      fullHours,
      minutes
    );
    let returndate = new Date();
    if (TypeRent == "priceDay") {
      returndate = new Date(
        selectedDate.year,
        selectedDate.month - 1,
        selectedDate.day + Number(NumbDay),
        12,
        0
      );
    } else if (TypeRent == "priceNight") {
      returndate = new Date(
        selectedDate.year,
        selectedDate.month - 1,
        selectedDate.day + 1,
        12,
        0
      );
    } else if (TypeRent == "priceHour") {
      returndate = new Date(
        selectedDate.year,
        selectedDate.month - 1,
        selectedDate.day,
        fullHours + Number(Numb),
        minutes
      );
    }
    const dateString = date?.toISOString();
    const returnString = returndate?.toISOString();
    console.log(dateString, returnString);
    const formdata = new FormData();
    formdata.set("Date", dateString);
    formdata.set("returnDate", returnString);
    formdata.set("startHour", startHour);
    formdata.set("numbDay", NumbDay);
    formdata.set("numbHour", Numb);
    formdata.set("id", id);
    formdata.set("TypeRent", TypeRent);
    console.log("Hello");
    const response = await CheckAvaRoom(formdata);
    UpdateModal(false);
    updatecheckoutdate((prev) => {
      return {
        ...prev,
        [getPriceKey(TypeRent)]: response.checkout_date,
      };
    });
    updatelistroom((prev) => {
      return prev.map((room, index) => {
        return {
          ...room,
          price: {
            ...room.price,
            [getPriceKey(TypeRent)]: response?.listprice[index].price,
          },
        };
      });
    });
  };
  const [Numb, updateNumb] = useState("2");
  const [NumbDay, updateNumbDay] = useState("1");
  const [checkoutdate, updatecheckoutdate] = useState<{
    priceDay: Date;
    priceNight: Date;
    priceHour: Date;
  }>({
    priceDay: checkout.priceDay,
    priceNight: checkout.priceNight,
    priceHour: checkout.priceHour,
  });
  const [TypeRent, UpdateTypeRent] = useState("priceHour");
  const [listrooms, updatelistroom] = useState<ReturnListRoom[]>(listroom);
  const [Modal, UpdateModal] = useState(false);
  const [startHour, ChangeStartHour] = useState(getCurrentHour());
  const [chooseRoom, UpdateChooseRoom] = useState<ReturnListRoom | null>(null);
  console.log();
  console.log(chooseRoom);
  const OnClickUpdateTypeRent = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.currentTarget.id) {
      UpdateTypeRent(e.currentTarget.id);
      UpdateModal(false);
    }
  };
  const onChooseRoom = (e: React.MouseEvent<HTMLButtonElement>) => {
    UpdateChooseRoom(
      listrooms.find((lr) => lr.id === Number(e.currentTarget.id)) || null
    );
  };

  return (
    <div>
      {!chooseRoom ? (
        <>
          {" "}
          <div className=" flex flex-col space-y-2">
            <h5 className=" font-bold text-green-500 text-lg">Chọn phòng</h5>
            <div className=" flex w-full space-x-2">
              <button
                id="priceHour"
                onClick={OnClickUpdateTypeRent}
                className={
                  TypeRent == "priceHour"
                    ? "w-1/3 bg-green-600 text-white rounded-2xl flex justify-center items-center space-x-1 py-1"
                    : "w-1/3 bg-white text-green-600 hover:bg-green-600 hover:bg-opacity-50 hover:text-white rounded-2xl flex justify-center items-center space-x-1 py-1"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <div>Theo giờ</div>
              </button>
              <button
                id="priceNight"
                onClick={OnClickUpdateTypeRent}
                className={
                  TypeRent == "priceNight"
                    ? "w-1/3 bg-green-600 text-white rounded-2xl flex justify-center items-center space-x-1 py-1"
                    : "w-1/3 bg-white text-green-600 hover:bg-green-600 hover:bg-opacity-50 hover:text-white rounded-2xl flex justify-center items-center space-x-1 py-1"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                  />
                </svg>

                <div>Qua đêm</div>
              </button>
              <button
                id="priceDay"
                onClick={OnClickUpdateTypeRent}
                className={
                  TypeRent == "priceDay"
                    ? "w-1/3 bg-green-600 text-white rounded-2xl flex justify-center items-center space-x-1 py-1"
                    : "w-1/3 bg-white text-green-600 hover:bg-green-600 hover:bg-opacity-50 hover:text-white rounded-2xl flex justify-center items-center space-x-1 py-1"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className=" w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                  />
                </svg>

                <div>Theo ngày</div>
              </button>
            </div>
            <div className=" font-bold ">Nhận phòng</div>
            <div className=" flex justify-between w-full">
              <div className=" w-1/2 flex space-x-2">
                <DatePickers
                  setSelectedDate={setSelectedDate}
                  selectedDate={selectedDate}
                  UpdateModal={UpdateModal}
                ></DatePickers>
                <CustomSelect
                  selectedDate={selectedDate}
                  startHour={startHour}
                  ChangeStartHour={ChangeStartHour}
                  UpdateModal={UpdateModal}
                ></CustomSelect>
              </div>
              <div className=" w-2/3 flex justify-end items-center space-x-2">
                {TypeRent == "priceHour" && (
                  <CustomSelectHour
                    Numb={Numb}
                    updateNumb={updateNumb}
                    UpdateModal={UpdateModal}
                  ></CustomSelectHour>
                )}
                {TypeRent == "priceNight" && (
                  <div className="w-1/2 max-w-xl flex flex-row gap-4">
                    <DatePicker
                      isDisabled={true}
                      label="Ngày trả "
                      variant="bordered"
                      hideTimeZone
                      onChange={() => {
                        UpdateModal(true);
                      }}
                      showMonthAndYearPickers
                    />
                  </div>
                )}
                {TypeRent == "priceDay" && (
                  <CustomSelectDay
                    NumbDay={NumbDay}
                    updateNumbDay={updateNumbDay}
                    UpdateModal={UpdateModal}
                  ></CustomSelectDay>
                )}
                <Button
                  color="success"
                  onClick={UpdateTypeHandler}
                  className=" text-white py-7"
                  endContent={<CameraIcon />}
                >
                  Tìm phòng
                </Button>
              </div>
            </div>
            {checkoutdate[getPriceKey(TypeRent)] && (
              <div className="text-sm text-gray-600">
                Trả phòng:{" "}
                {formatDateToCustomString(checkoutdate[getPriceKey(TypeRent)])}
              </div>
            )}
          </div>
          <div className=" relative grid grid-cols-2 mt-4 ">
            {Modal && (
              <div className="w-full h-full z-10 absolute bg-black opacity-70 text-center text-slate-200">
                <div className=" pt-10">
                  Nhấn tìm phòng để cập nhật kết quả{" "}
                </div>
              </div>
            )}
            {listrooms.map((lr, index) => {
              return (
                <EachRoom
                  images={lr.images}
                  name={lr.name}
                  price={lr.price[getPriceKey(TypeRent)]}
                  utilities={lr.utilities}
                  UpdateChooseRoom={onChooseRoom}
                  key={lr.id}
                  id={Number(lr.id)}
                ></EachRoom>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className=" flex flex-col p-2 space-y-4  ">
            <button
              onClick={() => {
                UpdateChooseRoom(null);
              }}
              className=" hover:scale-105 flex space-x-2 text-green-600"
            >
              <NavigateBack size={5}></NavigateBack>
              <p className=" font-medium text-green-600">{name}</p>
            </button>
            <div className=" flex space-x-5 w-full items-center">
              <div className="flex flex-col p-4 py-6 border rounded-xl w-1/2">
                <Gallery images={chooseRoom?.images || []}></Gallery>
                <div className="flex flex-col space-y-1">
                  <h5 className=" font-bold text-2xl pb-1 pt-2">
                    {chooseRoom?.name}
                  </h5>
                  {chooseRoom?.utilities.map((utility) => {
                    return (
                      <p
                        key={utility}
                        className=" text-gray-800 font-extralight"
                      >
                        - {utility}
                      </p>
                    );
                  })}
                </div>
              </div>

              <form className=" w-1/2 rounded-xl  bg-primary space-y-4 py-8 px-6 bg-opacity-15">
                <h5 className=" text-lg font-bold pb-2">
                  Nhập thông tin đặt phòng của bạn
                </h5>
                <Input type="email" id="email" label="Email" />
                <Input type="text" id="phonenumber" label="Số điện thoại" />
                <Input type="text" id="name" label="Họ và Tên" />
                <Input
                  type="textarea"
                  id="specialRequest"
                  label="Yêu cầu đặt biệt"
                ></Input>
              </form>
            </div>
            <div className=" w-full space-y-4 py-4 px-4 border rounded-xl">
              <h5 className=" text-medium text-green-600">
                Bạn có thể thanh toán trước
              </h5>
              <RadioGroup>
                <Radio value="cash">
                  <CreditCardOutlined style={{ marginRight: "8px" }} />
                  Thanh toán khi nhận phòng
                </Radio>
                <Radio value="visa">
                  <QrcodeOutlined style={{ marginRight: "8px" }} />
                  Quét mã QR trên ứng dụng ngân hàng
                </Radio>
              </RadioGroup>
            </div>
            <div className=" relative overflow-hidden w-full space-y-3 py-4 px-4 pb-20 border rounded-xl">
              <h5 className="  text-lg font-bold text-green-600">
                Chi tiết đặt phòng của bạn
              </h5>
              <div className=" flex space-x-1">
                <div className=" font-thin">Nhận phòng:</div>
                <div className=" font-bold">
                  {formatDateToCustomStringDay(
                    new Date(
                      selectedDate.year,
                      selectedDate.month - 1,
                      selectedDate.day,
                      Number(startHour),
                      0
                    )
                  )}
                </div>
              </div>
              <div className=" flex space-x-1">
                <div className=" font-thin">Trả phòng:</div>
                <div className=" font-bold">
                  {formatDateToCustomStringDay(
                    checkoutdate[getPriceKey(TypeRent)]
                  )}
                </div>
              </div>
              <div className=" flex space-x-1">
                <div className=" font-thin">Tổng thời gian lưu trú:</div>
                <div className=" font-bold">
                  {TypeRent === "priceDay"
                    ? `${NumbDay} ngày`
                    : TypeRent === "priceHour"
                    ? `${Numb} giờ`
                    : "1 đêm"}{" "}
                </div>
              </div>
              <div className=" flex space-x-1">
                <div className=" font-thin">Phòng: {chooseRoom.name} :</div>
                <div className=" font-bold">
                  {formatPrice(chooseRoom.price[getPriceKey(TypeRent)])}
                </div>
              </div>
              <div className="absolute bottom-0 py-3 left-0 items-center px-4 bg-green-600 bg-opacity-15  w-full flex justify-between">
                <div>
                  <div className=" text-lg font-medium ">Giá</div>
                  <div className=" text-sm text-gray-500">
                    {"(Đã bao gồm thuế, phí)"}
                  </div>
                </div>
                <div className="  font-bold text-xl">
                  {formatPrice(chooseRoom.price[getPriceKey(TypeRent)])}
                </div>
              </div>
            </div>
            <Button
              onClick={onClickHandler}
              className=" w-full bg-green-600 text-white font-bold text-base "
            >
              Xác nhận đặt phòng
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
export default ChooseRoom;
