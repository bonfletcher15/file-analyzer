"use client";
import { useState, useRef } from 'react';
import { z } from 'zod';
import Modal from '@/components/ui/Modal';

const FileUploader = () => {
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState({ file: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);

    const fileInputRef = useRef(null);

    const virustotal_key = process.env.NEXT_PUBLIC_VIRUSTOTAL_KEY;

    const fileSchema = z
        .instanceof(File, { message: "Invalid file format." })
        .refine((file) => file.size < 5 * 1024 * 1024, { message: "File must be under 5MB." })
        .refine(
            (file) =>
                ["application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/pdf",
                    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                    "text/plain",
                    "application/x-msdownload"
                ].includes(file.type),
            { message: "Only DOCX, EXE, PDF, PPTX, and TXT are allowed." }
        );

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setErrors({ ...errors, file: '' });

        const result = fileSchema.safeParse(selectedFile);
        if (!result.success) {
            setErrors({ ...errors, file: result.error.issues[0].message });
            setFile(null);
        } else {
            setFile(selectedFile);
            setErrors({ ...errors, file: "" });
        }
    };

    const handleFileRemove = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setFile(null);
        setErrors({ ...errors, file: '' });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileAnalyze = async () => {
        setErrors({ ...errors, file: '' });

        if (!file) {
            setErrors({ ...errors, file: 'Please select a file to upload.' });
            return;
        }

        const result = fileSchema.safeParse(file);
        if (!result.success) {
            setErrors({ ...errors, file: result.error.issues[0].message });
            setFile(null);
            return;
        }

        try {
            setIsLoading(true);

            const getAnalysisId = async () => {
                const formData = new FormData();
                formData.append("file", file);

                const options = {
                    method: "POST",
                    headers: {
                        accept: "application/json",
                        "x-apikey": virustotal_key,
                    },
                    body: formData,
                };

                const response = await fetch("https://www.virustotal.com/api/v3/files", options);
                const data = await response.json();
                return data.data.id;
            };

            const getAnalysis = async (analysisId) => {
                const options = {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        'x-apikey': virustotal_key
                    },
                };

                let response = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, options);
                let data = await response.json();

                console.log("Initial analysis status:", data.data.attributes.status);

                let attempts = 0;
                const maxAttempts = 10;

                while ((data.data.attributes.status === "queued" ||
                    data.data.attributes.status === "in-progress") &&
                    attempts < maxAttempts) {

                    console.log(`Waiting for analysis to complete... Attempt ${attempts + 1}/${maxAttempts}`);

                    await new Promise(resolve => setTimeout(resolve, 15000));

                    response = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, options);
                    data = await response.json();
                    attempts++;
                }

                if (attempts >= maxAttempts) {
                    throw new Error("Analysis is taking too long. Please check the results later.");
                }

                console.log("Final analysis:", data);
                return data.data.attributes;
            };

            const analysisId = await getAnalysisId();
            const result = await getAnalysis(analysisId);

            setAnalysisResult(result);
            setIsResultModalOpen(true);
            setIsLoading(false);
            setFile(null);

        } catch (error) {
            setIsLoading(false);
            setErrors({ ...errors, file: error.message });
        }
    };

    const handleModalClose = () => {
        setIsResultModalOpen(false);
    };

    return (
        <div className="bg-white flex flex-col p-8 rounded-xl shadow-lg w-96 mx-auto mt-20 gap-10">
            {/* Gray out the title when isLoading is true */}
            <h2 className={`text-2xl font-bold text-center ${isLoading ? 'text-gray-400' : ''}`}>
                Welcome to File Analyzer!
            </h2>

            {/* Disable the label interaction when isLoading is true */}
            <label
                className={`cursor-pointer h-44 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-md p-3 text-gray-500 hover:border-green-400 hover:text-green-400 transition-all group ${errors.file ? 'border-red-500 text-red-500' : ''} ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
            >
                {file === null ? (
                    <div className="flex gap-2">
                        <svg className={`w-5 h-5 text-gray-400 group-hover:text-green-400 ${errors.file ? 'text-red-500' : ''}`} fill="none" stroke="currentColor"
                            strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M12 16v-4m0 0v-4m0 4H8m4 0h4M4 12a8 8 0 1116 0 8 8 0 01-16 0z"></path>
                        </svg>
                        <span className="text-sm font-medium">Upload a file</span>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            ref={fileInputRef}
                            disabled={isLoading} // Disable file input when loading
                        />
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <span className="text-sm font-medium ml-5 group-hover:ml-0 transition-all duration-200">{file.name}</span>
                        <button
                            onClick={handleFileRemove}
                            type="button"
                            disabled={isLoading} // Disable the remove button when loading
                            className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-500 hover:text-red-500 ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                )}
            </label>
            {errors.file && <span className="text-red-500 text-sm">{errors.file}</span>}
            <button
                onClick={handleFileAnalyze}
                className="w-full flex justify-center p-3 rounded-md font-semibold transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-green-500 hover:bg-green-600 focus:ring-green-200 text-white"
                disabled={isLoading}
            >
                {isLoading ? (
                    // Add a loader (spinner) inside the button
                    <div className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                    </div>
                ) : (
                    'Analyze file'
                )}
            </button>

            <Modal isOpen={isResultModalOpen} onClose={handleModalClose} width="w-[40rem]" title="File Analysis Results">
                <div className="p-2 overflow-y-auto max-h-[80vh] mb-6">
                    <h2 className="text-lg font-semibold mb-2">Results</h2>
                    <ul className="bg-gray-100 p-3 rounded-md text-sm space-y-2">
                        {analysisResult && Object.entries(analysisResult.results).map(([key, value]) => (
                            <li key={key} className="flex justify-between">
                                <span className="font-semibold">{key}:</span>
                                <span>{value.category}</span>
                            </li>
                        ))}
                    </ul>

                    <h2 className="text-lg font-semibold mt-4 mb-2">Stats</h2>
                    <ul className="bg-gray-100 p-3 rounded-md text-sm space-y-2">
                        {analysisResult && Object.entries(analysisResult.stats).map(([key, value]) => (
                            <li key={key} className="flex justify-between">
                                <span className="font-semibold">{key}:</span>
                                <span>{value}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <button onClick={handleModalClose}
                    className="w-full flex justify-center p-3 rounded-md font-semibold transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-green-500 hover:bg-green-600 focus:ring-green-200 text-white">
                    Ok
                </button>
            </Modal>
        </div>
    );
};

export default FileUploader;