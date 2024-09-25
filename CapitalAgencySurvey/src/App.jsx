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
    const [surveyData, setSurveyData] = useState(null);
    const surveyRef = useRef(null);

    useEffect(() => {
        setSurveyData(null);
    }, []);

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

    const formatAnswer = (answer) => {
        if (typeof answer === 'boolean') {
            return answer ? 'Yes' : 'No';
        }
        if (Array.isArray(answer)) {
            return answer.map((item, index) => {
                if (typeof item === 'object') {
                    return `(${index + 1}) ` + Object.entries(item)
                        .map(([key, value]) => `${key}: ${formatAnswer(value)}`)
                        .join(', ');
                }
                return item;
            }).join('; ');
        }
        if (typeof answer === 'object' && answer !== null) {
            return Object.entries(answer)
                .map(([key, value]) => `${key}: ${formatAnswer(value)}`)
                .join(', ');
        }
        return answer;
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
            .send('service_ixtaxqx', 'template_48z67wb', templateParams, 'wWdvyJyRHAHCelIWk')
            .then(
                (response) => {
                    console.log('Email sent successfully:', response.status, response.text);
                },
                (error) => {
                    console.error('Failed to send email:', error);
                }
            );

        const formattedData = [];

        surveyRef.current.getAllQuestions().forEach((question) => {
            const questionTitle = question.title || question.name;
            const questionAnswer = formatAnswer(data[question.name]);

            if (questionAnswer !== undefined) {
                formattedData.push({
                    question: questionTitle,
                    answer: questionAnswer,
                });
            }
        });

        setSurveyData(formattedData);
    };

    const codeBlockStyle = {
        backgroundColor: isDark ? '#2e2e2e' : '#f4f4f4',
        color: isDark ? '#ffffff' : '#000000',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        overflowX: 'auto',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        width: '80%',
        maxWidth: '800px',
        margin: '20px auto',
    };

    const containerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        marginTop: '30px',
        padding: '20px',
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
            {surveyData && (
                <div style={containerStyle}>
                    <h3>Your Responses:</h3>
                    
                    <pre style={codeBlockStyle}>
                        {surveyData.map((item, index) => (
                            <p key={index}>
                                <strong>{item.question}</strong> {item.answer}
                            </p>
                        ))}
                    </pre>
                    
                </div>
            )}
        </div>
    );
};

export default App;
