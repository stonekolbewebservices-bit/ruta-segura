import React from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import classNames from 'classnames';

const LoadingProgress = ({ currentStep, steps }) => {
    return (
        <div className="bg-dark-card/95 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-2xl">
            <div className="space-y-3">
                {steps.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;
                    const isPending = index > currentStep;

                    return (
                        <div
                            key={index}
                            className={classNames(
                                "flex items-center gap-3 transition-all duration-300",
                                isActive && "scale-105",
                                isPending && "opacity-40"
                            )}
                        >
                            <div className={classNames(
                                "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                isCompleted && "bg-green-500",
                                isActive && "bg-blue-500",
                                isPending && "bg-gray-600"
                            )}>
                                {isCompleted ? (
                                    <CheckCircle className="w-4 h-4 text-white" />
                                ) : isActive ? (
                                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                                ) : (
                                    <span className="text-xs text-gray-400">{index + 1}</span>
                                )}
                            </div>

                            <div className="flex-1">
                                <p className={classNames(
                                    "text-sm font-medium transition-colors",
                                    isCompleted && "text-green-400",
                                    isActive && "text-blue-400",
                                    isPending && "text-gray-500"
                                )}>
                                    {step.label}
                                </p>
                                {step.description && isActive && (
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {step.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
            </div>
        </div>
    );
};

export default LoadingProgress;
