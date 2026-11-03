import React from 'react';

interface IconProps {
  className?: string;
}

export function SolarArrowRightBold({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.4697 5.46967C13.7626 5.17678 14.2374 5.17678 14.5303 5.46967L20.5303 11.4697C20.8232 11.7626 20.8232 12.2374 20.5303 12.5303L14.5303 18.5303C14.2374 18.8232 13.7626 18.8232 13.4697 18.5303C13.1768 18.2374 13.1768 17.7626 13.4697 17.4697L18.1893 12.75H4C3.58579 12.75 3.25 12.4142 3.25 12C3.25 11.5858 3.58579 11.25 4 11.25H18.1893L13.4697 6.53033C13.1768 6.23744 13.1768 5.76256 13.4697 5.46967Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SolarBoltBoldDuotone({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        opacity="0.35"
        d="M13.6285 2.45966C14.1228 1.5471 15.5 1.90163 15.5 2.93933V9.5H19.0488C19.9985 9.5 20.5382 10.5872 19.9642 11.3435L10.3715 21.5403C9.8772 22.4529 8.5 22.0984 8.5 21.0607V14.5H4.9512C4.00148 14.5 3.4618 13.4128 4.03582 12.6565L13.6285 2.45966Z"
        fill="currentColor"
      />
      <path
        d="M15.5 2.93933C15.5 1.90163 14.1228 1.5471 13.6285 2.45966L4.03582 12.6565C3.4618 13.4128 4.00148 14.5 4.9512 14.5H12V2.93933H15.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SolarPrinterBoldDuotone({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        opacity="0.35"
        d="M6 8V5C6 3.34315 7.34315 2 9 2H15C16.6569 2 18 3.34315 18 5V8H6Z"
        fill="currentColor"
      />
      <path
        d="M6 17H18V19C18 20.6569 16.6569 22 15 22H9C7.34315 22 6 20.6569 6 19V17Z"
        fill="currentColor"
      />
      <path
        opacity="0.65"
        d="M2 12C2 9.79086 3.79086 8 6 8H18C20.2091 8 22 9.79086 22 12V15C22 16.6569 20.6569 18 19 18H18V15H6V18H5C3.34315 18 2 16.6569 2 15V12Z"
        fill="currentColor"
      />
      <circle cx="17.5" cy="11.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function SolarShieldCheckBoldDuotone({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        opacity="0.35"
        d="M3 10.4167C3 7.21907 3 5.62028 3.37752 5.08241C3.75503 4.54454 5.25832 4.02996 8.26491 3.00079L8.83772 2.80472C10.405 2.26824 11.1886 2 12 2C12.8114 2 13.595 2.26824 15.1623 2.80472L15.7351 3.00079C18.7417 4.02996 20.245 4.54454 20.6225 5.08241C21 5.62028 21 7.21907 21 10.4167V11.9914C21 17.6294 16.761 20.3655 13.8986 21.5273C12.68 22.0219 11.32 22.0219 10.1014 21.5273C7.23896 20.3655 3 17.6294 3 11.9914V10.4167Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.0303 9.46967C16.3232 9.76256 16.3232 10.2374 16.0303 10.5303L11.5303 15.0303C11.2374 15.3232 10.7626 15.3232 10.4697 15.0303L8.46967 13.0303C8.17678 12.7374 8.17678 12.2626 8.46967 11.9697C8.76256 11.6768 9.23744 11.6768 9.53033 11.9697L11 13.4393L14.9697 9.46967C15.2626 9.17678 15.7374 9.17678 16.0303 9.46967Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SolarCheckCircleBold({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM16.0303 8.96967C16.3232 9.26256 16.3232 9.73744 16.0303 10.0303L11.0303 15.0303C10.7374 15.3232 10.2626 15.3232 9.96967 15.0303L7.96967 13.0303C7.67678 12.7374 7.67678 12.2626 7.96967 11.9697C8.26256 11.6768 8.73744 11.6768 9.03033 11.9697L10.5 13.4393L14.9697 8.96967C15.2626 8.67678 15.7374 8.67678 16.0303 8.96967Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SolarChefHatBoldDuotone({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        opacity="0.35"
        d="M12 3C9.61385 3 7.6251 4.67194 7.1235 6.91174C5.35116 7.2952 4 8.86752 4 10.75C4 12.9591 5.79086 14.75 8 14.75H16C18.2091 14.75 20 12.9591 20 10.75C20 8.86752 18.6488 7.2952 16.8765 6.91174C16.3749 4.67194 14.3861 3 12 3Z"
        fill="currentColor"
      />
      <path
        d="M6.5 14.75H17.5V19C17.5 20.1046 16.6046 21 15.5 21H8.5C7.39543 21 6.5 20.1046 6.5 19V14.75Z"
        fill="currentColor"
      />
    </svg>
  );
}
