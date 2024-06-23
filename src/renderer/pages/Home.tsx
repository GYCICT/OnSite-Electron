import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { ArrowBack } from '@mui/icons-material';
import Login from '../components/Login';
import {
  CheckConnectivity,
  GetStudentActions,
  LoadStudents,
} from '../../api/functions';
import SelectStudent from './SelectStudent';
import ErrorModal from '../components/ErrorModal';
import Options from './Options';
import LoadSnackbar from '../components/CustomSnackbar';
import heartBeat from '../../api/heartbeat';
import Banner from '../../../assets/gycbanner.png';

function Home() {
  const [activeStep, setActiveStep] = useState(0);
  const [openError, setOpenError] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');
  const [errorCode, setErrorCode] = useState<string | number>();
  const [loading, setLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [studentData, setStudentData] = useState<any[]>();
  const [errorTimeout, setErrorTimeOut] = useState<number>();
  const [errorResets, setErrorResets] = useState<boolean>(false);

  const handleNextStep = () => {
    setActiveStep(activeStep + 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setOptions([]);
    setSelectedStudent('');
  };

  const handleError = (
    _errorText: string,
    _errorCode: string | number,
    _setTimeout?: number,
    _errorResets?: boolean,
  ) => {
    setOpenError(true);
    setErrorText(_errorText);
    setErrorCode(_errorCode);
    setErrorResets(_errorResets || false);
    setErrorTimeOut(_setTimeout || undefined);
  };

  const closeError = (resetApp?: boolean) => {
    setOpenError(false);
    // console.log(resetApp);
    if (resetApp) {
      handleReset();
    }
  };

  const init = () => {
    async function getStudentData() {
      const students = await LoadStudents();
      if (students) {
        setStudentData(students);
        setLoading(false);
      }
    }
    setLoading(true);
    getStudentData();
  };

  const setConnectionStatus = (connected: boolean) => {
    if (connected) {
      enqueueSnackbar('Connected!', { variant: 'success' });
    } else {
      enqueueSnackbar('Disconnected', { variant: 'error' });
    }
  };

  const checkConnection = async () => {
    const checkHeartBeat = await heartBeat();
    const checkConnectivity = await CheckConnectivity();

    enqueueSnackbar('Checking connection...', {
      variant: 'loadSnackbar',
      onClose: () => {
        if (checkHeartBeat.status < 300 && checkConnectivity.status < 300) {
          setConnectionStatus(true);
        } else {
          setConnectionStatus(false);
          handleError(
            `${checkHeartBeat.message} \n ${checkHeartBeat.response.data.Error} at ${checkHeartBeat.response.request.responseURL}`,
            checkHeartBeat.response.status,
          );
        }
      },
    });
  };

  useEffect(() => {
    init();
    checkConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setInterval(() => checkConnection(), 1800000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectedStudent = async (val: any) => {
    setLoading(true);
    const response = await GetStudentActions(val);
    if (response) {
      setSelectedStudent(val);
      setOptions(response.data);
      handleNextStep();
      setLoading(false);
    } else {
      handleError(
        'Student has no options in Kiosk. Please see office staff.',
        'No Student Actions',
        6000,
        true,
      );
      setLoading(false);
    }
  };

  const steps = [
    {
      label: 'Select Student',
    },
    {
      label: 'Select action',
    },
  ];

  return (
    <>
      <SnackbarProvider Components={{ loadSnackbar: LoadSnackbar }} />
      <Login init={() => init()} />
      <ErrorModal
        open={openError}
        errorText={errorText}
        errorCode={errorCode || 'Unknown Error'}
        closeError={(val: any) => closeError(val)}
        errorTimeout={errorTimeout || null}
        resetApp={errorResets}
      />
      <Box
        sx={{
          height: '30%',
          width: '100%',
          backgroundColor: '#182c5c',
          margin: 0,
        }}
      >
        <Container sx={{ padding: 2, width: '100%', display: 'inline-block' }}>
          <img src={Banner} alt="logo" width="15%" />
        </Container>
      </Box>
      {activeStep > 0 && (
        <Button sx={{ float: 'left', top: 10, left: 10 }} onClick={handleReset}>
          <ArrowBack fontSize="large" />
        </Button>
      )}

      <Container
        sx={{ textAlign: 'center', margin: 'auto', width: '50%', padding: 3 }}
      >
        <Stepper activeStep={activeStep}>
          {steps.map((step) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Container>

      <Container>
        {activeStep === 0 && (
          <SelectStudent
            setLoading={(val: any) => setLoading(val)}
            handleSelectedStudent={(val: any) => handleSelectedStudent(val)}
            handleNextStep={() => handleNextStep()}
            studentData={studentData || null}
          />
        )}
        {activeStep === 1 && (
          <Options
            options={options}
            StudentID={selectedStudent}
            handleReset={handleReset}
          />
        )}
      </Container>
      <Box
        sx={{
          width: '100%',
          height: '6vh',
          background:
            'linear-gradient(180deg, rgba(18,46,94,1) 0%, rgba(18,46,94,1) 25%, rgba(0,164,224,1) 25.1%, rgba(0,164,224,1) 50%, rgba(174,31,76,1) 50.1%, rgba(174,31,76,1) 75%, rgba(254,195,64,1) 75.1%, rgba(254,195,64,1) 100%)',
          margin: 0,
          position: 'fixed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'right',

          bottom: 0,
        }}
      >
        <Paper
          sx={{
            textAlign: 'center',
            display: 'inline-block',
            verticalAlign: 'middle',
            marginRight: 4,
          }}
        >
          {localStorage.getItem('version') && (
            <Typography sx={{ padding: 0.5 }}>
              {localStorage.getItem('version')}
            </Typography>
          )}
        </Paper>
      </Box>

      <Backdrop open={loading}>
        <CircularProgress />
      </Backdrop>
    </>
  );
}

export default Home;
