
interface InputProps {
    idName: string;
    value: string;
    label: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>|React.ChangeEvent<HTMLSelectElement>) => void;
    className?: string;
    type: string;
    options: Object[]; 
    isStudentSelect?: boolean;
}

export function CustomInput({ idName, value, onChange, className, type, label, options, isStudentSelect }: InputProps) {
    return (
        <div>
            <label htmlFor={idName} className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            {(type === 'text' || type === 'number' || type === 'password' || type === 'email') ?
                <input
                    type={type}
                    name={idName}
                    id={idName}
                    value={value}
                    onChange={onChange}
                    className={`mt-1 focus:ring-indigo-500 border focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 ${className}`}
                />
                :(type === 'select')?
                <select
                      id={idName}
                      name={idName}
                      value={value}
                      onChange={onChange}
                      className="mt-1 border focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3"
                      disabled={options?.length === 0}
                    >
                      <option value="">{(isStudentSelect)?'Selectionnez un étudiant':`Toutes les ${label}s`}</option>
                      {options.map((option) => (
                        <option key={Object.values(option)[0]} value={Object.values(option)[0]}>
                            {isStudentSelect ? `${Object.values(option)[1]} ${Object.values(option)[2]} ${Object.values(option)[3]}` : Object.values(option)[1]}
                        </option>
                      ))}
                    </select>
                : 
                <input
                    type={type}
                    name={idName}
                    id={idName}
                    value={value}
                    onChange={onChange}
                    className={`mt-1 focus:ring-indigo-500 border focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 ${className}`}
                />
                
            }
            <div className="mt-1">

            </div>
        </div>
    );
}