import React, { useState, useEffect, useRef } from 'react';
import SurveyComponent from './components/SurveyComponent';
import surveyJson from './survey.json';
import emailjs from 'emailjs-com';
import Navbar from './components/NavBar';
import { Model } from 'survey-core';
import theme2 from './themes/theme2';
import theme2Dark from './themes/theme2Dark';

const App = () => {
    const [isDark, setIsDark] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const surveyRef = useRef(null);

    useEffect(() => {
        surveyRef.current = new Model(surveyJson);
        surveyRef.current.applyTheme(isDark ? theme2Dark : theme2);
        setIsInitialized(true);
    }, []);

    const handleDarkModeToggle = () => {
        setIsDark(!isDark);
    };

    useEffect(() => {
        if (isInitialized && surveyRef.current) {
            surveyRef.current.applyTheme(isDark ? theme2Dark : theme2);
        }
    }, [isDark, isInitialized]);

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
            .send('service_ixtaxqx', 'template_48z67wb', templateParams, 'wWdvyJyRHAHCelIWk')
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
            <Navbar handleDarkModeToggle={handleDarkModeToggle} isDark={isDark} />
            <div className="Survey">
                {isInitialized && surveyRef.current && (
                    <SurveyComponent 
                        survey={surveyRef.current} 
                        isDark={isDark} 
                        onComplete={handleSurveyComplete} 
                    />
                )}
            </div>
        </div>
    );
};

export default App;