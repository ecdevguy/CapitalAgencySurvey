import React, { useState, useEffect, useRef } from 'react';
import SurveyComponent from './components/SurveyComponent';
import surveyJson from './survey.json';
import emailjs from 'emailjs-com';
import Navbar from './components/NavBar';
import { Model } from 'survey-core';
import theme2 from './themes/theme2';
import theme2Dark from './themes/theme2Dark';
import { BeatLoader } from 'react-spinners';

const App = () => {
    const [isDark, setIsDark] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [surveyData, setSurveyData] = useState(null);
    const [surveyResponse, setSurveyResponse] = useState('')
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

    const findSurveyQuestion = (questionName) => {
        const searchElements = (elements) => {
            for (const element of elements) {
                if (element.name === questionName) {
                    return element;
                }
                if (element.elements && Array.isArray(element.elements)) {
                    const foundInElements = searchElements(element.elements);
                    if (foundInElements) {
                        return foundInElements;
                    }
                }
                if (element.templateElements && Array.isArray(element.templateElements)) {
                    const foundInTemplate = searchElements(element.templateElements);
                    if (foundInTemplate) {
                        return foundInTemplate;
                    }
                }
            }
            return null;
        };
        for (const page of surveyJson.pages) {
            const found = searchElements(page.elements);
            if (found) {
                return found;
            }
        }
        return null;
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

        const formattedData = [];
        const formattedEmailData = [];

        surveyRef.current.getAllQuestions().forEach((question) => {
            const surveyQuestion = findSurveyQuestion(question.name);
            const questionTitle = surveyQuestion?.formattedTitle || question.title || question.name;
            const questionAnswer = data[question.name];
        
            if (surveyQuestion?.type === 'paneldynamic' && Array.isArray(surveyQuestion.templateElements) && Array.isArray(questionAnswer)) {
                questionAnswer.forEach((panel, panelIndex) => {
                    formattedData.push(
                        <p key={`${question.name}-${panelIndex}-header`}><strong>{questionTitle}{' '}{panelIndex + 1}</strong></p>
                    );
                    formattedEmailData.push({
                        question: questionTitle + ' ' + panelIndex + 1,
                        answer: null
                    }
                    );
                    surveyQuestion.templateElements.forEach((element) => {
                        const elementAnswer = panel[element.name];
                        if (elementAnswer !== undefined) {
                            formattedData.push(
                                <div key={`${question.name}-${panelIndex}-${element.name}`}>
                                    <p>{element.formattedTitle || element.title}</p>
                                    <p>{formatAnswer(elementAnswer)}</p>
                                    <br />
                                </div>
                            );
                            formattedEmailData.push({
                                question: element.formattedTitle || element.title,
                                answer: formatAnswer(elementAnswer)
                            }
                            );
                        }
                    });
                });
            }
        
            if (surveyQuestion?.type === 'panel' && Array.isArray(surveyQuestion.elements)) {
                formattedData.push(
                    <p key={`${question.name}-header`}><strong>{questionTitle}</strong></p>
                );
                formattedEmailData.push({
                    question: questionTitle,
                    answer: null
                }
                );
                surveyQuestion.elements.forEach((element) => {
                    const elementAnswer = questionAnswer ? questionAnswer[element.name] : undefined;
                    if (elementAnswer !== undefined) {
                        formattedData.push(
                            <div key={`${question.name}-${element.name}`}>
                                <p>{element.formattedTitle || element.title}</p>
                                <p>{formatAnswer(elementAnswer)}</p>
                                <br />
                            </div>
                        );
                        formattedEmailData.push({
                            question: element.formattedTitle || element.title,
                            answer: formatAnswer(questionAnswer)
                        }
                        );
                    }
                });
            }
        
            if (!Array.isArray(surveyQuestion?.templateElements) && !Array.isArray(surveyQuestion?.elements) && questionAnswer !== undefined) {
                formattedData.push(
                    <div key={question.name}>
                        <p><strong>{questionTitle}</strong></p>
                        <p>{formatAnswer(questionAnswer)}</p>
                        <br />
                    </div>
                );
                formattedEmailData.push({
                    question: questionTitle,
                    answer: formatAnswer(questionAnswer)
                }
                );
            }
        });
        
        setSurveyData(formattedData);
        const formattedMessage = formattedEmailData
        .map((item) => {
            if(item.answer === null) {
                `${item.question}\n`
            } else {
                return `${item.question}\n${item.answer}\n\n`;
            }
        })
        .join('');
        const templateParams = {
            name: 'Corbin',
            client: `${firstName}`,
            insurance: `${insuranceList}`,
            message: formattedMessage,
        };

        emailjs
            .send('service_ixtaxqx', 'template_48z67wb', templateParams, 'wWdvyJyRHAHCelIWk')
            .then(
                (response) => {
                    console.log('Email sent successfully:', response.status, response.text);
                    setSurveyResponse(
                        <h1 style={{ textAlign: 'center' }}>
                            Your survey has been submitted successfully!
                        </h1>
                    );
                },
                (error) => {
                    console.error('Failed to send email:', error);
                    setSurveyResponse(
                        <>
                            <h1 style={{ textAlign: 'center', marginBottom: '25px' }}>
                                There was an error submitting your survey.
                            </h1>
                            <h2 style={{ textAlign: 'center' }}>
                                Please refresh the page and try again.
                            </h2>
                        </>
                    );
                }
            );


        // emailjs testing
        // emailjs
        //     .send('service_131ckhq', 'template_hevsges', templateParams, 'q5qh7MhNpv6fcOKXV')
        //     .then(
        //         (response) => {
        //             console.log('Email sent successfully:', response.status, response.text);
        //             setSurveyResponse(
        //                 <h1 style={{ textAlign: 'center' }}>
        //                     Your survey has been submitted successfully!
        //                 </h1>
        //             );
        //         },
        //         (error) => {
        //             console.error('Failed to send email:', error);
        //             setSurveyResponse(
        //                 <>
        //                     <h1 style={{ textAlign: 'center', marginBottom: '25px' }}>
        //                         There was an error submitting your survey.
        //                     </h1>
        //                     <h2 style={{ textAlign: 'center' }}>
        //                         Please refresh the page and try again.
        //                     </h2>
        //                 </>
        //             );
        //         }
        //     );

            
            setIsInitialized(false);
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
                    <div style={{
                        margin: '80px',
                    }}>
                    {surveyResponse ? 
                        surveyResponse :
                        <BeatLoader color={isDark ? '#19b394' : '#437fd9'} loading={true} size={40}/>
                    }
                    </div>
                    <h3>Your Responses:</h3>
                    <pre style={codeBlockStyle}>
                        {surveyData}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default App;


