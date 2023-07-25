import { IonNote } from '@ionic/react';
import { format } from 'date-fns';
import React, { forwardRef } from 'react';
import { useRecoilValue } from 'recoil';
import { User, userAtom } from '../recoil/userAtom';

interface ContainerProps {
    details: any;
}

const Receipt = forwardRef<HTMLDivElement, ContainerProps>(({ details }, ref) => {
    const user = useRecoilValue<User>(userAtom);
    // console.log(details.sales);
    const toWords = (n: number): string => {
        let num =
            "Zero One Two Three Four Five Six Seven Eight Nine Ten Eleven Twelve Thirteen Fourteen Fifteen Sixteen Seventeen Eighteen Nineteen".split(
                " "
            );
        let tens = "Twenty Thirty Fourty Fifty Sixty Seventy Eighty Ninety".split(
            " "
        );
        if (n < 20) return num[n];
        var digit = n % 10;
        if (n < 100)
            return tens[~~(n / 10) - 2] + (digit ? " " + num[digit] : "");
        if (n < 1000)
            return (
                num[~~(n / 100)] +
                " Hundred" +
                (n % 100 == 0 ? "" : " " + toWords(n % 100))
            );
        if (n >= 1000 && n < 999999) {
            return (
                toWords(~~(n / 1000)) +
                " Thousand" +
                (n % 1000 == 0 ? "" : " " + toWords(n % 1000))
            );
        } else {
            return (
                toWords(~~(n / 1000000)) +
                " Million" +
                (n % 1000000 == 0 ? "" : " " + toWords(n % 1000000))
            );
        }
    }
    return (
        <div ref={ref} className="w-[7.9cm] mx-auto">
            <div className="flex flex-col text-center">
                <span>JJB FOODS AND PROCESSING LTD</span>
                <p>No 5 Doka Street, By Halima<br /> Junction, Kaduna State</p>
                <div className="text-center">
                    <b className='mr-2'>08187897156</b>
                    <b>08104017275</b>
                </div>
                <span className='text-lg border-b mb-1 border-b-black'>JJB</span>
                <div className="bg-black p-2 w-3/4 mx-auto text-white" style={{backgroundColor: "#000", color: "#fff"}}>
                    <span>{details.mode} Sales</span>
                </div>
            </div>
            <div className="flex flex-col">
                <span className='border-b mb-1 border-b-black'><b>Customer's Name: </b>{details.customer_name}</span>
                <span><b>Date of Sales: </b>{details.date}</span>
                <span><b>Invoice No: </b>{details.invoice}</span>
            </div>
            <table className='w-full border-collapse border'>
                <thead>
                    <tr className='border border-black text-center'>
                        <th className='border border-black'>S/N</th>
                        <th className='border border-black'>Qty</th>
                        <th className='border border-black'>Description</th>
                        <th className='border border-black'>Rate</th>
                        <th className='border border-black'>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {details.sales.map((value: { qty: number; name: string; price: number; total: number; index: number; }, index: number) => (
                        <tr className='border border-black' key={"table_item_" + index}>
                        <td className='border border-black text-center'>{value.index}</td>
                            <td className='border border-black text-center'>{value.qty}</td>
                            <td className='border border-black'>{value.name}</td>
                            <td className='border border-black'>₦{value.price}</td>
                            <td className='border border-black'>₦{value.total}</td>
                        </tr>))}
                </tbody>
            </table>
            <table className='w-full'>
                <tbody>
                    <tr>
                        <th className='text-left'>Total Amount:</th>
                        <td>₦{details.total}</td>
                    </tr>
                    <tr>
                        <th className='text-left'>Discount:</th>
                        <td>₦{0}</td>
                    </tr>
                    <tr>
                        <th className='text-left'>Amount Paid:</th>
                        <td>₦{details.paid}</td>
                    </tr>
                    <tr>
                        <th className='text-left'>Balance c/d:</th>
                        <td>₦{details.balance()}</td>
                    </tr>
                </tbody>

            </table>
            <div className="flex flex-col border p-1 text-center">
                <span><b>Amount Paid in Words:</b></span>
                <span><i>{toWords(details.paid || 0)} Naira Only</i></span>
            </div>
            <div className="flex flex-col">
                <table className="w-full">
                    <tbody>
                        <tr>
                            <th className="text-left"><span>Sold By:</span></th>
                            <td>{user.name|| "no name"}</td>
                        </tr>
                        <tr>
                            <th className="text-left"><span>Printed On</span></th>
                            <td>{format(new Date(), "EEEE, dd LLLL yy")}</td>
                        </tr>
                        <tr>
                            <th className="text-left"><span>Total balance</span></th>
                            <td>₦{0}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="flex flex-col text-sm">
                <div className='flex'>
                    <b>Signature:</b><span className="border-b border-b-black w-full"></span>
                </div>
                <div className="flex justify-center">
                    <span className='mr-3'><b> for:</b></span>
                    <span>JJB FOODS PROCESSING LTD</span>
                    </div>
                
            </div>

        </div>
    );
});

export default Receipt;