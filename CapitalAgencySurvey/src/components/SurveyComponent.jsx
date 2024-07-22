import React, { useEffect } from 'react';
import * as Survey from 'survey-react-ui';
import 'survey-core/defaultV2.css';
import theme2 from '../themes/theme2';
import theme2Dark from '../themes/theme2Dark';

const SurveyComponent = ({ survey, isDark, onComplete }) => {

    const decodeVin = async (vin) => {
        console.log('Decoding VIN:', vin);
        try {
            const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`);
            const data = await response.json();
            const result = data.Results[0];
            const make = result.Make ? result.Make : "n/a";
            const model = result.Model ? result.Model : "n/a";
            console.log('Decoded Make:', make, 'Model:', model);
            return { make, model };
        } catch (err) {
            console.error('Error decoding VIN:', err);
            return { make: '', model: '' };
        }
    };

    const handleVinBlur = async (event, options) => {
        const vin = event.target.value;
        console.log('VIN input blurred:', vin);
        if (!vin) return;

        const { make, model } = await decodeVin(vin);

        const parentPanel = options.question.parent;

        if (parentPanel) {
            const makeQuestion = parentPanel.getQuestionByName("makeAuto");
            const modelQuestion = parentPanel.getQuestionByName("modelAuto");

            if (makeQuestion && modelQuestion) {
                makeQuestion.value = make;
                modelQuestion.value = model;
            } else {
                console.error('Make or Model question not found in the parent panel.');
            }
        } else {
            console.error('Parent panel not found for the VIN input.');
        }
    };

    useEffect(() => {
        if (survey) {
            survey.onAfterRenderQuestion.add((sender, options) => {
                if (options.question.name === "vin") {
                    const input = options.htmlElement?.querySelector("input");
                    if (input) {
                        input.onblur = (event) => handleVinBlur(event, options);
                    }
                }
            });

            survey.onComplete.add((result) => {
                onComplete(result.data);
            });

            return () => {
                survey.onAfterRenderQuestion.clear();
                survey.onComplete.clear();
            };
        }
    }, [survey]);

    useEffect(() => {
        if (survey) {
            survey.applyTheme(isDark ? theme2Dark : theme2);
        }
    }, [isDark, survey]);

    return <Survey.Survey model={survey} />;
};

export default SurveyComponent;