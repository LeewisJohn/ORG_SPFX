import * as React from 'react';

const Persona: React.FC<any> = ({
    userDisplayName,
    jobTitle,
}) => {
    return (
        <div className="persona">
            <div className="persona-img">

            </div>
            <div className="persona-info">
                <span className="persona-name">
                    {userDisplayName}
                </span>
                <span className="persona-title">
                    {jobTitle}
                </span>
            </div>
        </div>
    );
}

export default Persona;
