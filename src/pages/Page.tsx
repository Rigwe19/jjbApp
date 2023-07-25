import { IonContent, IonPage } from '@ionic/react';
import { useParams } from 'react-router';
import './Page.css';
import Brands from '../components/Brands';
import Locations from '../components/Locations';
import AddEmployee from './Account/addEmployer';
import Departments from '../components/Department';
import Logins from '../components/Logins';
import Recipes from '../components/Recipe';
import Toolbar from '../components/toolbar';

const Page: React.FC = () => {

  const { name } = useParams<{ name: string; }>();
  // const [image, setImage] = useState("");
  // const result = useRef<any>({});
  // const [state, setState] = useState({ passport: "" });
  // const select = async () => {
  //   let image: any[] = [];
  //   result.current = await FilePicker.pickFiles({
  //     types: ['image/*'],
  //     multiple: false,
  //     readData: true
  //   });
  //   result.current.files.forEach((element: any) => {
  //     setState({ ...state, passport: "data:" + element.mimeType + ";base64," + element.data });
  //   });
  // }

  // const takePicture = async () => {
  //   const image = await Camera.getPhoto({
  //     quality: 90,
  //     source: CameraSource.Camera,
  //     allowEditing: false,
  //     resultType: CameraResultType.DataUrl
  //   });

  //   var imageUrl = image.dataUrl;
  //   var ext = image.format;
  //   setImage(imageUrl);
  //   console.log(imageUrl, ext);
  //   // imageElement.src
  // }
  return (
    <IonPage>
      <Toolbar title={name} />

      <IonContent className='ion-padding' fullscreen>
        {/* <IonButtons>
          <IonButton onClick={takePicture} size="small" className='my-3'>
            <IonIcon icon={cameraOutline} slot="icon-only" />
          </IonButton>
        </IonButtons> */}

        {/* <pre>
          {JSON.stringify(image, null, 2)}
        </pre> */}
        {/* {image && <img className='w-[90%] mx-auto rounded-md' src={image} alt="my face" />} */}
        {/* <ExploreContainer name={name} /> */}
        {name === "Brand" && <Brands />}
        {name === "Location" && <Locations />}
        {name === "Employee" && <AddEmployee /> }
        {name === "Department" && <Departments /> }
        {name === "Logins" && <Logins /> }
        {name === "Recipes" && <Recipes /> }
      </IonContent>
    </IonPage>
  );
};

export default Page;
