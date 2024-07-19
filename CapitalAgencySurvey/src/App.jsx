import React, { useState } from 'react';
import SurveyComponent from './components/SurveyComponent';
import surveyJson from './survey.json';
import emailjs from 'emailjs-com';
import Navbar from './components/NavBar';


const App = () => {
    const [isDark, setIsDark] = useState(false);
    const handleDarkModeToggle = () => {
      setIsDark(!isDark);
    };
    const handleSurveyComplete = (data) => {
        const checkInsuranceTypes = (data) => {
            const insuranceTypes = [];
            if (data.homeInsurance) {
                insuranceTypes.push('Home Insurance');
            }
            if (data.autoInsurance) {
                insuranceTypes.push('Auto Insurance');
            }
            if (data.boatInsurance) {
                insuranceTypes.push('Boat Insurance');
            }
            if (data.boatTrailerInsurance) {
                insuranceTypes.push('Boat Trailer Insurance');
            }
            if (data.rvInsurance) {
                insuranceTypes.push('RV Insurance');
            }
            return insuranceTypes.join(', ');
        };
      
        const insuranceList = checkInsuranceTypes(data);
        const homeOwnerInfo = data.homeOwnerInfo || [];
        const firstName = homeOwnerInfo.length > 0 ? homeOwnerInfo[0].firstName : 'N/A';

        const templateParams = {
          name: 'Corbin',
          client: `${firstName}`,
          insurance: `${insuranceList}`,
          message: JSON.stringify(data, null, 2),
        };
    
        emailjs
          .send('service_131ckhq', 'template_hevsges', templateParams, 'q5qh7MhNpv6fcOKXV')
          .then(
            (response) => {
              console.log('Email sent successfully:', response.status, response.text);
            },
            (error) => {
              console.error('Failed to send email:', error);
            }
          );
      };

    return (
        <div className="App">
          <Navbar handleDarkModeToggle={handleDarkModeToggle} isDark={isDark}/>
            {/* <button onClick={() => setIsDark(!isDark)}>toggle</button> */}
            <div className="Survey">
              <SurveyComponent json={surveyJson} isDark={isDark} onComplete={handleSurveyComplete}/>
            </div>
        </div>
    );
};

export default App;
