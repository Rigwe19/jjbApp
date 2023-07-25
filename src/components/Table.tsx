import './ExploreContainer.css';
import { ReactChild, ReactFragment, ReactPortal } from 'react';
import React, { forwardRef } from 'react';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonChip, IonLoading, IonText } from '@ionic/react';

interface ContainerProps {
  headers?: any;
  data?: any;
  total?: any;
  segment: string;
}

const TableComponent = forwardRef<HTMLTableElement, ContainerProps>((props, ref) => {

  return (
        <div ref={ref} className="mb-1">
          <table className='border-collapse border color:border-[--ion-border-color] w-full rounded-md'>
            <thead>
              <tr className='bg-[--ion-color-green]'>
                <th className='vertical border bdcolor p-2'>Batch</th>
                {props.segment !== "all" && <th className='vertical border bdcolor p-2'>Bag Type</th>}
                {/* <th className='vertical border bdcolor p-2'>Bag type</th> */}
                {props.headers.map((value: { id: React.Key; type: boolean | ReactChild | ReactFragment | ReactPortal; }) => (
                  <th key={value.id} className='vertical border bdcolor p-2'>{value.type}</th>
                ))}

              </tr>
            </thead>
            <tbody>
              {props.data.map((value: any[], index: number) => {
                return (
                  <tr key={`table_row_${index}`} className='stripe'>
                    <td className='border bdcolor p-2'><span className='text-blue-500'>Batch {index + 1}</span></td>
                    {props.segment !== "all" && <td className='border bdcolor p-2 text-right'>
                      <span>{value[0].bag_type}</span>
                    </td>}
                    {value.map((val: { value: number; bag_type: boolean | ReactChild | ReactFragment | ReactPortal; }, ind: any) => (
                      <td key={`${index}_${ind}`} className='border bdcolor p-2 text-right'><span className={val.value > 0 ? "text-green-400" : ""}>{val.value}</span></td>
                    ))}
                  </tr>
                )
              })}
              <tr className='stripe'>
                <td className='border bdcolor p-2'><span className='text-blue-500'>Total</span></td>
                {props.segment !== "all" && <td className='border bdcolor p-2'><span className='text-blue-500'></span></td>}
                {props.total.map((val: { total: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal; }, ind: any) => (
                  <td key={`_${ind}`} className='border bdcolor p-2 text-right'> <span className='text-blue-500' color='secondary'>{val.total}</span></td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
  );
});

export default TableComponent;
