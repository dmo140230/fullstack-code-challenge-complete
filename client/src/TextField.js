import React from 'react';

const TextField = ({name, onChange, onBlur, error, label, type}) => (
    <input type={type} name={name} onChange={onChange} onBlur={onBlur} />
);

export default TextField;