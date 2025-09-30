/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

type TrainingEvent = {
  id: number;
  status: string;
  activity: string;
  time: string;
  notes: string;
  shiftLead: string;
};

// FIX: Changed squadId index signature from number to string. JavaScript object
// keys are implicitly strings, and this more accurate typing helps TypeScript's
// inference engine correctly type the result of Object.values(), fixing an error
// where a property was accessed on an `unknown` type.
type SquadSchedule = {
  [squadId: string]: TrainingEvent[];
};

type CalendarData = {
  [dateKey: string]: SquadSchedule;
};

type ViewMode = 'year' | 'month' | 'week';

type ScheduledTask = {
  week: number;
  squad: number;
  metl: string;
  task: string;
};

const trainingPlan: ScheduledTask[] = [
  // OCTOBER
  { week: 1, squad: 1, metl: '3-3.1.1', task: 'CCIR Reporting Procedures' },
  { week: 1, squad: 2, metl: '3-3.1.14', task: 'Oversee Development and Implementation of Site Certification and Annual Training Program' },
  { week: 1, squad: 3, metl: '3-3.4.1', task: 'Restore Prime Power after a Power failure' },
  { week: 1, squad: 4, metl: '3-3.9.1', task: 'AN/USC-28 Theory of Operation' },
  { week: 2, squad: 1, metl: '3-3.9.2', task: 'AN/USC-28 Overview' },
  { week: 2, squad: 2, metl: '3-3.9.8', task: 'Operate/Maintain De-icers for Antenna Subsystem AS-3199C/TSC' },
  { week: 2, squad: 3, metl: '3-3.9.9', task: 'Operate/Maintain Dehydrator Assembly for Antenna Subsystem AS-3199C/TSC' },
  { week: 2, squad: 4, metl: '3-3.1.2', task: 'Review Master Station Log (MSL)' },
  { week: 3, squad: 1, metl: '3-3.1.15', task: 'Maintain Site TMDE Program' },
  { week: 3, squad: 2, metl: '3-3.4.2', task: 'Maintain AC power Distribution System in Van' },
  { week: 3, squad: 3, metl: '3-3.6.1', task: 'Precure Parts from Provisional Stock' },
  { week: 3, squad: 4, metl: '3-3.8.1', task: 'Conduct Shift Change' },
  { week: 4, squad: 1, metl: '3-3.9.6', task: 'AN/USC-28 Troubleshooting' },
  { week: 4, squad: 2, metl: '3-3.1.3', task: 'Operate/Maintain GCSS-Army' },
  { week: 4, squad: 3, metl: '3-3.1.16', task: 'Perform Facility Manager Functions' },
  { week: 4, squad: 4, metl: '3-3.4.3', task: 'Initiate Emergency Shutdown Procedures' },
  { week: 5, squad: 1, metl: '3-3.6.2', task: 'Properly Utilize DA Form 2404/2407 for repair/maintenance actions' },
  { week: 5, squad: 2, metl: '3-3.8.2', task: 'Prepare Master Station Log (MSL)' },
  { week: 5, squad: 3, metl: '3-3.9.5', task: 'AN/USC-28 Halt/Run' },
  { week: 5, squad: 4, metl: '3-3.9.10', task: 'Operate Terminal Processor' },
  // NOVEMBER
  { week: 6, squad: 1, metl: '3-3.1.4', task: 'Maintain Site Configuration Plan' },
  { week: 6, squad: 2, metl: '3-3.4.4', task: 'Transfer Site Power to Generators (Automatic and Manual)' },
  { week: 6, squad: 3, metl: '3-3.6.3', task: 'Use GCSS-A Automated Maintenance Form 5990 to Record Maintenance' },
  { week: 6, squad: 4, metl: '3-3.9.3', task: 'AN/USC-28 RX/TX Monitors' },
  { week: 7, squad: 1, metl: '3-3.9.4', task: 'AN/USC-28 Net Entry' },
  { week: 7, squad: 2, metl: '3-3.9.14', task: 'Maintain Frequency Timing Subsystem Switching Assembly (FTSA)' },
  { week: 7, squad: 3, metl: '3-3.1.5', task: 'Establish and Review Training Files' },
  { week: 7, squad: 4, metl: '3-3.4.5', task: 'Transfer Site Power to Commercial Power Source (Automatic and Manual)' },
  { week: 8, squad: 1, metl: '3-3.7.1', task: 'React to Fire' },
  { week: 8, squad: 2, metl: '3-3.1.6', task: 'Request Authorized Service Interruption (ASI)' },
  { week: 8, squad: 3, metl: '3-3.3.1', task: 'O/M Digital Data Test Set, Fireberd' },
  { week: 8, squad: 4, metl: '3-3.7.2', task: 'Inclement Weather Plan' },
  { week: 9, squad: 1, metl: '3-3.8.3', task: 'Submit HAZCON Report' },
  { week: 9, squad: 2, metl: '3-3.8.4', task: 'Perform Daily Checks' },
  { week: 9, squad: 3, metl: '3-3.11.3', task: 'FAB-T Startup/Shutdown' },
  { week: 9, squad: 4, metl: '3-3.1.7', task: 'Receive, Process and Store Repair Parts' },
  // DECEMBER
  { week: 10, squad: 1, metl: '3-3.3.2', task: 'O/M Oscilloscopes' },
  { week: 10, squad: 2, metl: '3-3.7.3', task: 'COMSEC Emergency Destruction Plan' },
  { week: 10, squad: 3, metl: '3-3.8.5', task: 'Conduct Site Briefing' },
  { week: 10, squad: 4, metl: '3-3.11.4', task: 'FAB-T Terminal Setup' },
  { week: 11, squad: 1, metl: '3-3.1.8', task: 'Maintain Shop Supply List (SSL) Inventory' },
  { week: 11, squad: 2, metl: '3-3.3.3', task: 'O/M Spectrum Analyzers' },
  { week: 11, squad: 3, metl: '3-3.7.4', task: 'React to Bomb Threat' },
  { week: 11, squad: 4, metl: '3-3.8.7', task: 'Prepare and Submit a Satellite Equipment Report (SER)' },
  { week: 12, squad: 1, metl: '3-3.8.8', task: 'Inspect Maintenance Forms for Proper Completion' },
  { week: 12, squad: 2, metl: '3-3.11.5', task: 'FAB-T Establish EHF' },
  { week: 12, squad: 3, metl: '3-3.11.6', task: 'FAB-T Data Set Manager' },
  { week: 12, squad: 4, metl: '3-3.1.9', task: 'Maintain Historical Records' },
  { week: 13, squad: 1, metl: '3-3.3.6', task: 'O/M Multimeters' },
  { week: 13, squad: 2, metl: '3-3.7.5', task: 'React to Disgruntled Employees' },
  { week: 13, squad: 3, metl: '3-3.8.9', task: 'Supervise Maintenance and Repair of Signal Equipment' },
  { week: 13, squad: 4, metl: '3-3.8.10', task: 'Reference a Part Number with FEDLOG' },
  // JANUARY
  { week: 14, squad: 1, metl: '3-3.11.7', task: 'FAB-T Using EHF Communications' },
  { week: 14, squad: 2, metl: '3-3.11.8', task: 'FAB-T EHF Control' },
  { week: 14, squad: 3, metl: '3-3.1.10', task: 'Oversee Development and Implementaion of Site Emergency Action Plan' },
  { week: 14, squad: 4, metl: '3-3.2.1', task: 'Conduct Shift to Shift Inventory of COMSEC Material' },
  { week: 15, squad: 1, metl: '3-3.2.2', task: 'Destroy COMSEC / Classifed Material' },
  { week: 15, squad: 2, metl: '3-3.2.3', task: 'Maintain a SF 702 Security Container Checklist' },
  { week: 15, squad: 3, metl: '3-3.7.6', task: 'React to HEMP/EMP Event' },
  { week: 15, squad: 4, metl: '3-3.11.9', task: 'FAB-T DAMA Communications' },
  { week: 16, squad: 1, metl: '3-3.11.10', task: 'FAB-T Administrator/Security Officer Tasks' },
  { week: 16, squad: 2, metl: '3-3.1.11', task: 'Manage the DISA Directed Maintenance Program' },
  { week: 16, squad: 3, metl: '3-3.2.4', task: 'Operate/Maintain KIV-7M' },
  { week: 16, squad: 4, metl: '3-3.2.5', task: 'Operate/Maintain KGV-9' },
  { week: 17, squad: 1, metl: '3-3.7.7', task: 'React to Unauthorized Access' },
  { week: 17, squad: 2, metl: '3-3.1.12', task: 'Maintain COMSEC Account' },
  { week: 17, squad: 3, metl: '3-3.2.7', task: 'Operate/Maintain KGV-135A' },
  { week: 17, squad: 4, metl: '3-3.2.8', task: 'Operate/Maintain KG-175D' },
  // FEBRUARY
  { week: 18, squad: 1, metl: '3-3.2.9', task: 'Operate/Maintain an Simple Key Loader (SKL)' },
  { week: 18, squad: 2, metl: '3-3.3.9', task: 'O/M Signal / Sweep Generators' },
  { week: 18, squad: 3, metl: '3-3.3.10', task: 'O/M Current Probe' },
  { week: 18, squad: 4, metl: '3-3.7.8', task: 'React to Chemical and/or Biological Agent Attack' },
  { week: 19, squad: 1, metl: '3-3.1.13', task: 'Oversee Site Key Control Program' },
  { week: 19, squad: 2, metl: '3-3.2.10', task: 'Control Classified / FOUO Material/Documents' },
  { week: 19, squad: 3, metl: '3-3.2.11', task: 'Maintain a 1999R Restricted Area Visitor Access Control Log' },
  { week: 19, squad: 4, metl: '3-3.7.9', task: 'React to Active Shooter' },
  { week: 20, squad: 1, metl: '3-3.4.2', task: 'Maintain AC power Distribution System in Van' },
  { week: 20, squad: 2, metl: '3-3.11.1', task: 'FAB-T Theory of Operation' },
  { week: 20, squad: 3, metl: '3-3.11.2', task: 'FAB-T Hardware Overview' },
  { week: 20, squad: 4, metl: '3-3.4.1', task: 'Restore Prime Power after a Power failure' },
  { week: 21, squad: 1, metl: '3-3.4.3', task: 'Initiate Emergency Shutdown Procedures' },
  { week: 21, squad: 2, metl: '3-3.6.1', task: 'Precure Parts from Provisional Stock' },
  { week: 21, squad: 3, metl: '3-3.9.6', task: 'AN/USC-28 Troubleshooting' },
  { week: 21, squad: 4, metl: '3-3.1.3', task: 'Operate/Maintain GCSS-Army' },
  { week: 22, squad: 1, metl: '3-3.4.4', task: 'Transfer Site Power to Generators (Automatic and Manual)' },
  { week: 22, squad: 2, metl: '3-3.6.2', task: 'Properly Utilize DA Form 2404/2407 for repair/maintenance actions' },
  { week: 22, squad: 3, metl: '3-3.9.5', task: 'AN/USC-28 Halt/Run' },
  { week: 22, squad: 4, metl: '3-3.4.5', task: 'Transfer Site Power to Commercial Power Source (Automatic and Manual)' },
  // MARCH
  { week: 23, squad: 1, metl: '3-3.6.3', task: 'Use GCSS-A Automated Maintenance Form 5990 to Record Maintenance' },
  { week: 23, squad: 2, metl: '3-3.9.3', task: 'AN/USC-28 RX/TX Monitors' },
  { week: 23, squad: 3, metl: '3-3.9.4', task: 'AN/USC-28 Net Entry' },
  { week: 23, squad: 4, metl: '3-3.9.14', task: 'Maintain Frequency Timing Subsystem Switching Assembly (FTSA)' },
  { week: 24, squad: 1, metl: '3-3.3.1', task: 'O/M Digital Data Test Set, Fireberd' },
  { week: 24, squad: 2, metl: '3-3.7.1', task: 'React to Fire' },
  { week: 24, squad: 3, metl: '3-3.8.3', task: 'Submit HAZCON Report' },
  { week: 24, squad: 4, metl: '3-3.8.4', task: 'Perform Daily Checks' },
  { week: 25, squad: 1, metl: '3-3.11.3', task: 'FAB-T Startup/Shutdown' },
  { week: 25, squad: 2, metl: '3-3.3.2', task: 'O/M Oscilloscopes' },
  { week: 25, squad: 3, metl: '3-3.7.2', task: 'Inclement Weather Plan' },
  { week: 25, squad: 4, metl: '3-3.8.5', task: 'Conduct Site Briefing' },
  { week: 26, squad: 1, metl: '3-3.11.4', task: 'FAB-T Terminal Setup' },
  { week: 26, squad: 2, metl: '3-3.1.8', task: 'Maintain Shop Supply List (SSL) Inventory' },
  { week: 26, squad: 3, metl: '3-3.3.3', task: 'O/M Spectrum Analyzers' },
  { week: 26, squad: 4, metl: '3-3.7.3', task: 'COMSEC Emergency Destruction Plan' },
  // APRIL
  { week: 27, squad: 1, metl: '3-3.4.2', task: 'Maintain AC power Distribution System in Van' },
  { week: 27, squad: 2, metl: '3-3.9.1', task: 'AN/USC-28 Theory of Operation' },
  { week: 27, squad: 3, metl: '3-3.9.2', task: 'AN/USC-28 Overview' },
  { week: 27, squad: 4, metl: '3-3.9.8', task: 'Operate/Maintain De-icers for Antenna Subsystem AS-3199C/TSC' },
  { week: 28, squad: 1, metl: '3-3.9.9', task: 'Operate/Maintain Dehydrator Assembly for Antenna Subsystem AS-3199C/TSC' },
  { week: 28, squad: 2, metl: '3-3.1.15', task: 'Maintain Site TMDE Program' },
  { week: 28, squad: 3, metl: '3-3.4.1', task: 'Restore Prime Power after a Power failure' },
  { week: 28, squad: 4, metl: '3-3.4.3', task: 'Initiate Emergency Shutdown Procedures' },
  { week: 29, squad: 1, metl: '3-3.6.1', task: 'Precure Parts from Provisional Stock' },
  { week: 29, squad: 2, metl: '3-3.8.1', task: 'Conduct Shift Change' },
  { week: 29, squad: 3, metl: '3-3.9.6', task: 'AN/USC-28 Troubleshooting' },
  { week: 29, squad: 4, metl: '3-3.4.4', task: 'Transfer Site Power to Generators (Automatic and Manual)' },
  { week: 30, squad: 1, metl: '3-3.6.2', task: 'Properly Utilize DA Form 2404/2407 for repair/maintenance actions' },
  { week: 30, squad: 2, metl: '3-3.8.2', task: 'Prepare Master Station Log (MSL)' },
  { week: 30, squad: 3, metl: '3-3.9.5', task: 'AN/USC-28 Halt/Run' },
  { week: 30, squad: 4, metl: '3-3.9.10', task: 'Operate Terminal Processor' },
  { week: 31, squad: 1, metl: '3-3.1.4', task: 'Maintain Site Configuration Plan' },
  { week: 31, squad: 2, metl: '3-3.4.5', task: 'Transfer Site Power to Commercial Power Source (Automatic and Manual)' },
  { week: 31, squad: 3, metl: '3-3.6.3', task: 'Marksmanship' },
  { week: 31, squad: 4, metl: '3-3.9.3', task: 'AN/USC-28 RX/TX Monitors' },
  // MAY
  { week: 32, squad: 1, metl: '3-3.8.6', task: 'Signing over Keys for Shift Change' },
  { week: 32, squad: 2, metl: '3-3.8.5', task: 'Conduct Site Briefing' },
  { week: 32, squad: 3, metl: '3-3.7.2', task: 'Inclement Weather Plan' },
  { week: 32, squad: 4, metl: '3-3.3.2', task: 'O/M Oscilloscopes' },
  { week: 33, squad: 1, metl: '3-3.7.3', task: 'COMSEC Emergency Destruction Plan' },
  { week: 33, squad: 2, metl: '3-3.3.3', task: 'O/M Spectrum Analyzers' },
  { week: 33, squad: 3, metl: '3-3.11.4', task: 'FAB-T Terminal Setup' },
  { week: 33, squad: 4, metl: '3-3.11.3', task: 'FAB-T Startup/Shutdown' },
  { week: 34, squad: 1, metl: '3-3.8.10', task: 'Reference a Part Number with FEDLOG' },
  { week: 34, squad: 2, metl: '3-3.8.9', task: 'Supervise Maintenance and Repair of Signal Equipment' },
  { week: 34, squad: 3, metl: '3-3.7.4', task: 'React to Bomb Threat' },
  { week: 34, squad: 4, metl: '3-3.3.6', task: 'O/M Multimeters' },
  { week: 35, squad: 1, metl: '3-3.11.10', task: 'FAB-T Administrator/Security Officer Tasks' },
  { week: 35, squad: 2, metl: '3-3.11.9', task: 'FAB-T DAMA Communications' },
  { week: 35, squad: 3, metl: '3-3.8.13', task: 'Perform DISA Directed Maintenance' },
  { week: 35, squad: 4, metl: '3-3.8.12', task: 'Manage the PMCS Program on the AN/FRC-181 System' },
  // JUNE
  { week: 36, squad: 1, metl: '3-3.9.11', task: 'Terminal Server A/B Overview' },
  { week: 36, squad: 2, metl: '3-3.7.6', task: 'React to HEMP/EMP Event' },
  { week: 36, squad: 3, metl: '3-3.2.3', task: 'Maintain a SF 702 Security Container Checklist' },
  { week: 36, squad: 4, metl: '3-3.2.2', task: 'Destroy COMSEC / Classifed Material' },
  { week: 37, squad: 1, metl: '3-3.9.12', task: 'Server Switching Unit (SSU) Overview' },
  { week: 37, squad: 2, metl: '3-3.7.7', task: 'React to Unauthorized Access' },
  { week: 37, squad: 3, metl: '3-3.3.8', task: 'O/M Scalar Network Analyzer, AN/USM-660' },
  { week: 37, squad: 4, metl: '3-3.2.5', task: 'Operate/Maintain KGV-9' },
  { week: 38, squad: 1, metl: '3-3.2.9', task: 'Operate/Maintain an Simple Key Loader (SKL)' },
  { week: 38, squad: 2, metl: '3-3.3.9', task: 'O/M Signal / Sweep Generators' },
  { week: 38, squad: 3, metl: '3-3.7.8', task: 'React to Chemical and/or Biological Agent Attack' },
  { week: 38, squad: 4, metl: '3-3.9.13', task: 'Discrete Interface Unit (DIU) overview' },
  { week: 39, squad: 1, metl: '3-3.2.10', task: 'Control Classified / FOUO Material/Documents' },
  { week: 39, squad: 2, metl: '3-3.2.11', task: 'Maintain a 1999R Restricted Area Visitor Access Control Log' },
  { week: 39, squad: 3, metl: '3-3.7.9', task: 'React to Active Shooter' },
  { week: 39, squad: 4, metl: '3-3.9.15', task: 'Operate/Maintain Distribution Frequency Standard (DFS)' },
  // JULY
  { week: 40, squad: 1, metl: '3-3.4.1', task: 'Restore Prime Power after a Power failure' },
  { week: 40, squad: 2, metl: '3-3.11.2', task: 'FAB-T Hardware Overview' },
  { week: 40, squad: 3, metl: '3-3.11.1', task: 'FAB-T Theory of Operation' },
  { week: 40, squad: 4, metl: '3-3.4.2', task: 'Maintain AC power Distribution System in Van' },
  { week: 41, squad: 1, metl: '3-3.1.3', task: 'Operate/Maintain GCSS-Army' },
  { week: 41, squad: 2, metl: '3-3.9.6', task: 'AN/USC-28 Troubleshooting' },
  { week: 41, squad: 3, metl: '3-3.6.1', task: 'Precure Parts from Provisional Stock' },
  { week: 41, squad: 4, metl: '3-3.4.3', task: 'Initiate Emergency Shutdown Procedures' },
  { week: 42, squad: 1, metl: '3-3.4.5', task: 'Transfer Site Power to Commercial Power Source (Automatic and Manual)' },
  { week: 42, squad: 2, metl: '3-3.9.5', task: 'AN/USC-28 Halt/Run' },
  { week: 42, squad: 3, metl: '3-3.6.2', task: 'Properly Utilize DA Form 2404/2407 for repair/maintenance actions' },
  { week: 42, squad: 4, metl: '3-3.4.4', task: 'Transfer Site Power to Generators (Automatic and Manual)' },
  { week: 43, squad: 1, metl: '3-3.9.14', task: 'Maintain Frequency Timing Subsystem Switching Assembly (FTSA)' },
  { week: 43, squad: 2, metl: '3-3.9.4', task: 'AN/USC-28 Net Entry' },
  { week: 43, squad: 3, metl: '3-3.9.3', task: 'AN/USC-28 RX/TX Monitors' },
  { week: 43, squad: 4, metl: '3-3.6.3', task: 'Use GCSS-A Automated Maintenance Form 5990 to Record Maintenance' },
  { week: 44, squad: 1, metl: '3-3.8.4', task: 'Perform Daily Checks' },
  { week: 44, squad: 2, metl: '3-3.8.3', task: 'Submit HAZCON Report' },
  { week: 44, squad: 3, metl: '3-3.7.1', task: 'React to Fire' },
  { week: 44, squad: 4, metl: '3-3.3.1', task: 'O/M Digital Data Test Set, Fireberd' },
  // AUGUST
  { week: 45, squad: 1, metl: '3-3.11.4', task: 'FAB-T Terminal Setup' },
  { week: 45, squad: 2, metl: '3-3.8.6', task: 'Create and Submit COMSTAT to the Watch' },
  { week: 45, squad: 3, metl: '3-3.8.5', task: 'Conduct Site Briefing' },
  { week: 45, squad: 4, metl: '3-3.7.2', task: 'Inclement Weather Plan' },
  { week: 46, squad: 1, metl: '3-3.8.8', task: 'Inspect Maintenance Forms for Proper Completion' },
  { week: 46, squad: 2, metl: '3-3.8.7', task: 'Prepare and Submit a Satellite Equipment Report (SER)' },
  { week: 46, squad: 3, metl: '3-3.7.3', task: 'COMSEC Emergency Destruction Plan' },
  { week: 46, squad: 4, metl: '3-3.3.3', task: 'O/M Spectrum Analyzers' },
  { week: 47, squad: 1, metl: '3-3.11.8', task: 'FAB-T EHF Control' },
  { week: 47, squad: 2, metl: '3-3.11.7', task: 'FAB-T Using EHF Communications' },
  { week: 47, squad: 3, metl: '3-3.8.10', task: 'Reference a Part Number with FEDLOG' },
  { week: 47, squad: 4, metl: '3-3.8.9', task: 'Supervise Maintenance and Repair of Signal Equipment' },
  { week: 48, squad: 1, metl: '3-3.11.10', task: 'FAB-T Administrator/Security Officer Tasks' },
  { week: 48, squad: 2, metl: '3-3.11.9', task: 'FAB-T DAMA Communications' },
  { week: 48, squad: 3, metl: '3-3.7.5', task: 'React to Disgruntled Employees' },
  { week: 48, squad: 4, metl: '3-3.5.4', task: 'Perform Quarterly PMCS' },
  // SEPTEMBER
  { week: 49, squad: 1, metl: '3-3.7.6', task: 'React to HEMP/EMP Event' },
  { week: 49, squad: 2, metl: '3-3.2.3', task: 'Maintain a SF 702 Security Container Checklist' },
  { week: 49, squad: 3, metl: '3-3.2.2', task: 'Destroy COMSEC / Classifed Material' },
  { week: 49, squad: 4, metl: '3-3.2.1', task: 'Conduct Shift to Shift Inventory of COMSEC Material' },
  { week: 50, squad: 1, metl: '3-3.2.7', task: 'Operate/Maintain KGV-135A' },
  { week: 50, squad: 2, metl: '3-3.7.7', task: 'React to Unauthorized Access' },
  { week: 50, squad: 3, metl: '3-3.2.5', task: 'Operate/Maintain KGV-9' },
  { week: 50, squad: 4, metl: '3-3.2.4', task: 'Operate/Maintain KIV-7M' },
  { week: 51, squad: 1, metl: '3-3.5.6', task: 'Perform Daily PMCS' },
  { week: 51, squad: 2, metl: '3-3.5.5', task: 'Perform Monthly PMCS' },
  { week: 51, squad: 3, metl: '3-3.2.9', task: 'Operate/Maintain an Simple Key Loader (SKL)' },
  { week: 51, squad: 4, metl: '3-3.2.8', task: 'Operate/Maintain KG-175D' },
  { week: 52, squad: 1, metl: '3-3.3.4', task: 'O/M Power Meter' },
  { week: 52, squad: 2, metl: '3-3.2.11', task: 'Maintain a 1999R Restricted Area Visitor Access Control Log' },
  { week: 52, squad: 3, metl: '3-3.2.10', task: 'Control Classified / FOUO Material/Documents' },
  { week: 52, squad: 4, metl: '3-3.7.8', task: 'React to Chemical and/or Biological Agent Attack' },
  // Some tasks from other pages not in the weekly breakdown but included for completeness
  { week: 52, squad: 1, metl: '3-3.3.8', task: 'O/M Scalar Network Analyzer, AN/USM-660' },
  { week: 52, squad: 2, metl: '3-3.7.9', task: 'React to Active Shooter' },
  { week: 52, squad: 3, metl: '3-3.3.5', task: 'O/M Radiation Meter' },
  { week: 52, squad: 4, metl: '3-3.3.7', task: 'O/M Optical Power Test Set' },
];


const DisclaimerModal: React.FC<{ onAcknowledge: () => void }> = ({ onAcknowledge }) => (
  <div className="disclaimer-overlay">
    <div className="disclaimer-modal">
      <h2>Important Notice</h2>
      <p>
        This is an <strong>unofficial tool</strong> developed for use by the 114th Signal Company.
        It does not reflect the official views or endorsements of the U.S. Army, the Department of Defense (DoD), or the U.S. Government.
      </p>
      <p className="warning">
        <strong>DO NOT</strong> enter any Classified, Controlled Unclassified Information (CUI), or Personally Identifiable Information (PII) into this application.
      </p>
      <p>
        By clicking "Acknowledge," you confirm that you have read and understood this notice.
      </p>
      <button onClick={onAcknowledge} className="acknowledge-btn">Acknowledge</button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showPrintRangeModal, setShowPrintRangeModal] = useState(false);
  const [printStartDate, setPrintStartDate] = useState('');
  const [printEndDate, setPrintEndDate] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0));
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [newEventData, setNewEventData] = useState({
    date: new Date().toISOString().split('T')[0],
    activity: '',
    time: 'TBD',
    shiftLead: '',
    notes: '',
    status: 'Scheduled',
  });
  const [selectedSquads, setSelectedSquads] = useState<number[]>([]);
  
  const squads = [
    { name: 'Squad 1', id: 1 },
    { name: 'Squad 2', id: 2 },
    { name: 'Squad 3', id: 3 },
    { name: 'Squad 4', id: 4 },
  ];
  const trainingStatuses = ['Scheduled', 'Complete', 'Incomplete', 'Missed'];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getDateKey = (date: Date) => date.toISOString().split('T')[0];

  const [calendar, setCalendar] = useState<CalendarData>(() => {
    try {
      const savedData = localStorage.getItem('trainingCalendarData');
      return savedData ? JSON.parse(savedData) : {};
    } catch (error) {
      console.error("Error loading calendar data from localStorage", error);
      return {};
    }
  });

  const [lastEdited, setLastEdited] = useState<Date | null>(() => {
      try {
        const savedTimestamp = localStorage.getItem('trainingCalendarLastEdited');
        return savedTimestamp ? new Date(savedTimestamp) : null;
      } catch (error) {
        console.error("Error loading last saved timestamp from localStorage", error);
        return null;
      }
  });

  useEffect(() => {
    const isAcknowledged = sessionStorage.getItem('disclaimerAcknowledged');
    if (!isAcknowledged) {
      setShowDisclaimer(true);
    }
  }, []);
  
  useEffect(() => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const firstDayKey = getDateKey(firstDay);
    const lastDayKey = getDateKey(lastDay);
    setPrintStartDate(firstDayKey);
    setPrintEndDate(lastDayKey);
    setExportStartDate(firstDayKey);
    setExportEndDate(lastDayKey);
  }, [currentDate]);

  const handleAcknowledge = () => {
    sessionStorage.setItem('disclaimerAcknowledged', 'true');
    setShowDisclaimer(false);
  };

  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [editingEventData, setEditingEventData] = useState<Partial<TrainingEvent>>({});

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  }, []);
  
  const startOfWeek = useMemo(() => {
    const dateToUse = viewMode === 'week' ? currentDate : today;
    const start = new Date(dateToUse);
    const day = (dateToUse.getDay() + 6) % 7; // Monday = 0
    start.setDate(dateToUse.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return start;
  }, [today, currentDate, viewMode]);

  const endOfWeek = useMemo(() => {
    const end = new Date(startOfWeek);
    end.setDate(startOfWeek.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }, [startOfWeek]);

  const generateMonthDays = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const days = [];
    const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; 
    for (let i = startDayOfWeek; i > 0; i--) {
        const prevMonthDay = new Date(firstDayOfMonth);
        prevMonthDay.setDate(prevMonthDay.getDate() - i);
        days.push(prevMonthDay);
    }
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        days.push(new Date(year, month, i));
    }
    const daysCount = days.length;
    for (let i = 1; (daysCount + i -1) % 7 !== 0; i++) {
        const nextMonthDay = new Date(lastDayOfMonth);
        nextMonthDay.setDate(lastDayOfMonth.getDate() + i);
        days.push(nextMonthDay);
    }
    return days;
  };

  const generateWeekDays = (date: Date): Date[] => {
    const start = new Date(date);
    const day = (date.getDay() + 6) % 7; // Monday = 0
    start.setDate(date.getDate() - day);
    const week = [];
    for(let i=0; i<7; i++){
      const weekDay = new Date(start);
      weekDay.setDate(start.getDate() + i);
      week.push(weekDay);
    }
    return week;
  }
  
  const calendarDays = useMemo(() => {
    if (viewMode === 'month') return generateMonthDays(currentDate);
    if (viewMode === 'week') return generateWeekDays(currentDate);
    return [];
  }, [currentDate, viewMode]);
  
  const handleSave = () => {
    try {
      const newTimestamp = new Date();
      localStorage.setItem('trainingCalendarData', JSON.stringify(calendar));
      localStorage.setItem('trainingCalendarLastEdited', newTimestamp.toISOString());
      setLastEdited(newTimestamp);
      alert('Calendar saved successfully!');
    } catch (error) {
      console.error("Failed to save calendar data", error);
      alert("Error: Could not save calendar. Your browser's storage may be full.");
    }
  };

  const handleOpenPrintModal = () => {
      setShowPrintRangeModal(true);
  }

  const handlePrint = () => {
    if (!printStartDate || !printEndDate) {
        alert("Please select a valid start and end date.");
        return;
    }
    if (new Date(printStartDate) > new Date(printEndDate)) {
        alert("Start date cannot be after the end date.");
        return;
    }
    setShowPrintRangeModal(false);
    setTimeout(() => {
        window.print();
    }, 100);
  }

  const getFiscalYearInfo = (year: number) => {
    const fiscalYearStartDate = new Date(year - 1, 9, 1); // Month is 0-indexed, so 9 is October
    let firstWeekStartDate = new Date(fiscalYearStartDate);
    firstWeekStartDate.setHours(0,0,0,0);
    // Find the first Monday on or after October 1st
    while (firstWeekStartDate.getDay() !== 1) { // 1 is Monday
      firstWeekStartDate.setDate(firstWeekStartDate.getDate() + 1);
    }
    return { fiscalYearStartDate, firstWeekStartDate };
  };

  const handleGenerateSchedule = () => {
    const { fiscalYearStartDate, firstWeekStartDate } = getFiscalYearInfo(fiscalYear);
    const fiscalYearEndDate = new Date(fiscalYearStartDate);
    fiscalYearEndDate.setFullYear(fiscalYearEndDate.getFullYear() + 1);
    fiscalYearEndDate.setDate(fiscalYearEndDate.getDate() - 1);

    const clearedCalendar = { ...calendar };
    Object.keys(clearedCalendar).forEach(dateKey => {
      // The dateKey is 'YYYY-MM-DD'. Creating a new Date from this string can be
      // timezone-sensitive. To ensure a correct comparison, we parse the components
      // and create a date at midnight in the user's local timezone, which is
      // consistent with how fiscalYearStartDate and fiscalYearEndDate are created.
      const parts = dateKey.split('-').map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);

      if (d >= fiscalYearStartDate && d <= fiscalYearEndDate) {
          delete clearedCalendar[dateKey];
      }
    });

    const newCalendarData = { ...clearedCalendar };
    let eventIdCounter = Date.now();

    trainingPlan.forEach(task => {
      const taskDate = new Date(firstWeekStartDate);
      taskDate.setDate(taskDate.getDate() + (task.week - 1) * 7);
      const dateKey = getDateKey(taskDate);

      const newEvent: TrainingEvent = {
        id: eventIdCounter++,
        activity: `${task.metl} - ${task.task}`,
        time: 'TBD',
        shiftLead: '',
        notes: 'Auto-scheduled training for the week.',
        status: 'Scheduled',
      };

      const daySchedule = newCalendarData[dateKey] || {};
      const squadEvents = daySchedule[task.squad] || [];
      
      squadEvents.push(newEvent);
      daySchedule[task.squad] = squadEvents;
      newCalendarData[dateKey] = daySchedule;
    });
    
    setCalendar(newCalendarData);
    setShowGenerateModal(false);
    alert(`FY${fiscalYear} METL training schedule has been generated. Please review and click "Save Calendar" to persist changes.`);
  };

  const handleOpenExportModal = () => {
    setShowExportModal(true);
  };

  const handleExportData = () => {
    if (!exportStartDate || !exportEndDate) {
      alert("Please select a valid start and end date.");
      return;
    }
    if (exportStartDate > exportEndDate) {
      alert("Start date cannot be after the end date.");
      return;
    }

    const dataToExport: CalendarData = {};
    Object.keys(calendar)
      .sort()
      .forEach(dateKey => {
        if (dateKey >= exportStartDate && dateKey <= exportEndDate) {
          dataToExport[dateKey] = calendar[dateKey];
        }
      });
    
    let fileContent: string;
    let mimeType: string;
    let fileExtension: string;

    if (exportFormat === 'json') {
      fileContent = JSON.stringify(dataToExport, null, 2);
      mimeType = 'application/json';
      fileExtension = 'json';
    } else { // 'csv'
      const headers = ['Date', 'Squad Name', 'Activity', 'Time', 'Shift Lead', 'Status', 'Notes'];
      const escapeCsvField = (field: string | undefined): string => {
          if (field === undefined || field === null) return '';
          const str = String(field);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
      };

      const csvRows = [headers.join(',')];
      for (const dateKey in dataToExport) {
        const daySchedule = dataToExport[dateKey];
        for (const squadId in daySchedule) {
          const squadName = squads.find(s => s.id.toString() === squadId)?.name || `Squad ${squadId}`;
          const events = daySchedule[squadId];
          events.forEach(ev => {
            const row = [
              dateKey,
              squadName,
              escapeCsvField(ev.activity),
              escapeCsvField(ev.time),
              escapeCsvField(ev.shiftLead),
              escapeCsvField(ev.status),
              escapeCsvField(ev.notes),
            ];
            csvRows.push(row.join(','));
          });
        }
      }
      fileContent = csvRows.join('\n');
      mimeType = 'text/csv;charset=utf-8;';
      fileExtension = 'csv';
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-calendar_${exportStartDate}_to_${exportEndDate}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  }

  const handleNavigation = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setCurrentDate(new Date());
      return;
    }
    
    const newDate = new Date(currentDate);
    const amount = direction === 'prev' ? -1 : 1;

    if (viewMode === 'month') {
        newDate.setMonth(newDate.getMonth() + amount);
    } else if (viewMode === 'week') {
        newDate.setDate(newDate.getDate() + (7 * amount));
    } else if (viewMode === 'year') {
        newDate.setFullYear(newDate.getFullYear() + amount);
    }
    setCurrentDate(newDate);
  };
  
  const handleStatusChange = (date: Date, squadId: number, eventId: number, newStatus: string) => {
    const dateKey = getDateKey(date);
    setCalendar(prev => {
      if (!prev[dateKey]) return prev;
      const updatedCalendar = { ...prev };
      const updatedDay = { ...updatedCalendar[dateKey] };
      const updatedSquadEvents = updatedDay[squadId].map(ev => ev.id === eventId ? { ...ev, status: newStatus } : ev);
      updatedDay[squadId] = updatedSquadEvents;
      updatedCalendar[dateKey] = updatedDay;
      return updatedCalendar;
    });
  };

  const handleEditStart = (event: TrainingEvent) => {
    setEditingEventId(event.id);
    setEditingEventData(event);
  };

  const handleEditCancel = () => {
    setEditingEventId(null);
    setEditingEventData({});
  };
  
  const handleEditInputChange = (field: keyof Omit<TrainingEvent, 'id'>, value: string) => {
    setEditingEventData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditSave = (date: Date, squadId: number, eventId: number) => {
    const dateKey = getDateKey(date);
    setCalendar(prev => {
      if (!prev[dateKey]) return prev;
      const updatedCalendar = { ...prev };
      const updatedDay = { ...updatedCalendar[dateKey] };
      const updatedSquadEvents = updatedDay[squadId].map(ev => ev.id === eventId ? { ...editingEventData } as TrainingEvent : ev);
      updatedDay[squadId] = updatedSquadEvents;
      updatedCalendar[dateKey] = updatedDay;
      return updatedCalendar;
    });
    handleEditCancel();
  };

  const handleNewEventInputChange = (field: keyof typeof newEventData, value: string) => {
    setNewEventData(prev => ({ ...prev, [field]: value }));
  };

  const handleSquadSelection = (squadId: number) => {
    setSelectedSquads(prev =>
      prev.includes(squadId)
        ? prev.filter(id => id !== squadId)
        : [...prev, squadId]
    );
  };
  
  const handleSelectAllSquads = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedSquads(squads.map(s => s.id));
    } else {
      setSelectedSquads([]);
    }
  };
  
  const handleCreateEvent = () => {
    if (!newEventData.activity.trim()) {
      alert("Activity field cannot be empty.");
      return;
    }
    if (selectedSquads.length === 0) {
      alert("Please select at least one squad.");
      return;
    }

    setCalendar(prevCalendar => {
        const newCalendar = { ...prevCalendar };
        const dateKey = newEventData.date;
        const daySchedule = newCalendar[dateKey] ? { ...newCalendar[dateKey] } : {};

        selectedSquads.forEach(squadId => {
            const newEvent: TrainingEvent = {
                id: Date.now() + squadId, // simple unique id
                activity: newEventData.activity,
                time: newEventData.time,
                shiftLead: newEventData.shiftLead,
                notes: newEventData.notes,
                status: newEventData.status as 'Scheduled' | 'Complete' | 'Incomplete' | 'Missed',
            };
            const squadEvents = daySchedule[squadId] ? [...daySchedule[squadId]] : [];
            squadEvents.push(newEvent);
            daySchedule[squadId] = squadEvents;
        });

        newCalendar[dateKey] = daySchedule;
        return newCalendar;
    });

    handleCloseCreateModal();
  };

  const handleCloseCreateModal = () => {
      setShowCreateEventModal(false);
      setNewEventData({
          date: new Date().toISOString().split('T')[0],
          activity: '',
          time: 'TBD',
          shiftLead: '',
          notes: '',
          status: 'Scheduled',
      });
      setSelectedSquads([]);
  };
  
  const printableEvents = useMemo(() => {
    if (!printStartDate || !printEndDate) return [];
    
    const events = [];
    const sortedDateKeys = Object.keys(calendar).sort();
    
    const start = new Date(printStartDate);
    const end = new Date(printEndDate);

    for (const dateKey of sortedDateKeys) {
        const date = new Date(dateKey); 
        
        if (date < start || date > end) {
            continue;
        }
        
        const daySchedule = calendar[dateKey];
        if (daySchedule) {
            const eventsForDay = [];
            squads.forEach(squad => {
                if (daySchedule[squad.id] && daySchedule[squad.id].length > 0) {
                    eventsForDay.push({ squadName: squad.name, events: daySchedule[squad.id] });
                }
            });
            if (eventsForDay.length > 0) {
                events.push({ date: date, squadEvents: eventsForDay });
            }
        }
    }
    return events;
  }, [calendar, squads, printStartDate, printEndDate]);

  const renderCurrentDateHeader = () => {
    if (viewMode === 'year') {
        return currentDate.getFullYear();
    }
    if (viewMode === 'month') {
        return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    if (viewMode === 'week') {
      const weekStart = generateWeekDays(currentDate)[0];
      const weekEnd = generateWeekDays(currentDate)[6];
      return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
    }
  }
  
  const renderCalendarView = () => {
    if(viewMode === 'year') {
        return (
            <div className="year-view">
                {monthNames.map((month, monthIndex) => {
                    const monthDate = new Date(currentDate.getFullYear(), monthIndex, 1);
                    const days = generateMonthDays(monthDate);
                    return (
                        <div key={month} className="year-month-grid">
                            <h3 className="year-month-title">{month}</h3>
                            <div className="year-day-header">
                                {dayNames.map(d => <div key={d}>{d.charAt(0)}</div>)}
                            </div>
                            <div className="year-month-days">
                                {days.map(day => {
                                    const dateKey = getDateKey(day);
                                    // FIX: Added Array.isArray(s) check. This acts as a type guard,
                                    // preventing a runtime error and satisfying TypeScript's static analysis, which
                                    // was previously unable to infer that 's' was an array due to limitations with
                                    // Object.values() on types with index signatures.
                                    const hasEvents = calendar[dateKey] && Object.values(calendar[dateKey]).some(s => Array.isArray(s) && s.length > 0);
                                    const isTodayClass = getDateKey(day) === getDateKey(today) ? 'today' : '';
                                    const isCurrentMonthClass = day.getMonth() === monthIndex ? '' : 'not-current-month';
                                    return <div key={dateKey} className={`year-day ${isTodayClass} ${isCurrentMonthClass} ${hasEvents ? 'has-events' : ''}`}></div>
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="calendar" role="grid" aria-label="Training Calendar">
            <div className="calendar-header-row">
                {dayNames.map(day => <div key={day} className="calendar-header-cell">{day}</div>)}
            </div>
            {calendarDays.map((date, index) => {
                const dateKey = getDateKey(date);
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                const daySchedule = calendar[dateKey];
                const weekIndex = Math.floor(index / 7);
                const isAltWeek = weekIndex % 2 !== 0;
                const isCurrentWeek = date >= startOfWeek && date <= endOfWeek;
                const isToday = getDateKey(date) === getDateKey(today);
                const dayName = dayNames[(date.getDay() + 6) % 7];

                return (
                <div key={dateKey} className={`day-cell ${!isCurrentMonth && viewMode === 'month' ? 'not-current-month' : ''} ${isAltWeek ? 'week-alt-bg' : ''} ${isCurrentWeek && viewMode !== 'week' ? 'current-week' : ''}`} role="gridcell" aria-label={date.toDateString()}>
                    <div className="day-header">
                    <span className="day-name">{dayName}</span>
                    <span className={`day-number ${isToday ? 'today' : ''}`}>{date.getDate()}</span>
                    </div>
                    {squads.map((squad) => {
                    return (
                        <section key={squad.id} className={`squad-section squad-${squad.id}`} aria-label={`Training for ${squad.name} on ${date.toDateString()}`}>
                        <h3 className="squad-title">{squad.name}</h3>
                        <ul className="event-list" aria-live="polite">
                            {daySchedule?.[squad.id]?.map((ev) => {
                                const query = searchQuery.toLowerCase();
                                const isVisible = query === '' || ev.activity.toLowerCase().includes(query) || ev.notes.toLowerCase().includes(query) || ev.shiftLead.toLowerCase().includes(query);
                                return (
                                <li key={ev.id} className={`event-item status-${ev.status.toLowerCase()} ${!isVisible ? 'event-hidden' : ''}`}>
                                    {editingEventId === ev.id ? (
                                    <div className="edit-event-form">
                                        <div className="form-group"><input type="text" readOnly className="form-control" value={editingEventData.activity} onChange={(e) => handleEditInputChange('activity', e.target.value)} placeholder="Activity" /></div>
                                        <div className="form-group"><select className="form-control" value={editingEventData.status} onChange={(e) => handleEditInputChange('status', e.target.value)}>{trainingStatuses.map(status => <option key={status} value={status}>{status}</option>)}</select></div>
                                        <div className="form-group"><input type="text" className="form-control" value={editingEventData.time} onChange={(e) => handleEditInputChange('time', e.target.value)} placeholder="Time" /></div>
                                        <div className="form-group"><input type="text" className="form-control" value={editingEventData.shiftLead} onChange={(e) => handleEditInputChange('shiftLead', e.target.value)} placeholder="Shift Lead" /></div>
                                        <div className="form-group"><textarea className="form-control" value={editingEventData.notes} onChange={(e) => handleEditInputChange('notes', e.target.value)} placeholder="Notes / Objectives" rows={1}></textarea></div>
                                        <div className="event-actions"><button className="save-btn" onClick={() => handleEditSave(date, squad.id, ev.id)}>Save</button><button className="cancel-btn" onClick={handleEditCancel}>Cancel</button></div>
                                    </div>
                                    ) : (
                                    <>
                                        <div className="event-header">
                                        <strong className="event-name">{ev.activity}</strong>
                                        <select className="event-status-select" value={ev.status} onChange={(e) => handleStatusChange(date, squad.id, ev.id, e.target.value)} aria-label={`Change status for ${ev.activity}`}>
                                            {trainingStatuses.map(status => (<option key={status} value={status}>{status}</option>))}
                                        </select>
                                        </div>
                                        <div className="event-details"><span>Time: {ev.time || 'N/A'}</span> | <span>Lead: {ev.shiftLead || 'N/A'}</span></div>
                                        {ev.notes && <p className="event-notes">{ev.notes}</p>}
                                        <div className="event-actions"><button onClick={() => handleEditStart(ev)} className="edit-event-btn" aria-label={`Edit ${ev.activity}`}>Edit</button></div>
                                    </>
                                    )}
                                </li>
                                );
                            })}
                        </ul>
                    </section>
                    );
                })}
                </div>
                )
            })}
        </div>
    )
  }

  return (
    <>
      {showDisclaimer && <DisclaimerModal onAcknowledge={handleAcknowledge} />}
      {showPrintRangeModal && (
        <div className="disclaimer-overlay">
            <div className="print-range-modal">
                <h2>Select Date Range to Print</h2>
                <div className="print-range-form">
                    <div className="form-group">
                        <label htmlFor="start-date">Start Date</label>
                        <input id="start-date" type="date" className="form-control" value={printStartDate} onChange={e => setPrintStartDate(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="end-date">End Date</label>
                        <input id="end-date" type="date" className="form-control" value={printEndDate} onChange={e => setPrintEndDate(e.target.value)} />
                    </div>
                </div>
                <div className="modal-actions">
                    <button onClick={() => setShowPrintRangeModal(false)} className="cancel-btn">Cancel</button>
                    <button onClick={handlePrint} className="action-btn">Print</button>
                </div>
            </div>
        </div>
      )}
      {showGenerateModal && (
        <div className="disclaimer-overlay">
            <div className="generate-modal">
                <h2>Generate METL Schedule</h2>
                <div className="generate-form">
                    <div className="form-group">
                        <label htmlFor="fiscal-year">Fiscal Year (e.g., 2025 for FY25)</label>
                        <input id="fiscal-year" type="number" className="form-control" value={fiscalYear} onChange={e => setFiscalYear(Number(e.target.value))} />
                    </div>
                    <p className="modal-warning">
                        <strong>Warning:</strong> This will remove all events within the selected fiscal year (Oct 1 - Sep 30) and replace them with the standard METL schedule. This action cannot be undone.
                    </p>
                </div>
                <div className="modal-actions">
                    <button onClick={() => setShowGenerateModal(false)} className="cancel-btn">Cancel</button>
                    <button onClick={handleGenerateSchedule} className="action-btn">Generate</button>
                </div>
            </div>
        </div>
      )}
      {showExportModal && (
        <div className="disclaimer-overlay">
          <div className="export-modal">
            <h2>Export Calendar Data</h2>
            <div className="export-form">
              <div className="form-group">
                <label htmlFor="export-start-date">Start Date</label>
                <input id="export-start-date" type="date" className="form-control" value={exportStartDate} onChange={(e) => setExportStartDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="export-end-date">End Date</label>
                <input id="export-end-date" type="date" className="form-control" value={exportEndDate} onChange={(e) => setExportEndDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Format</label>
                <div className="format-selector">
                  <button className={`format-btn ${exportFormat === 'json' ? 'active' : ''}`} onClick={() => setExportFormat('json')} aria-pressed={exportFormat === 'json'}>JSON</button>
                  <button className={`format-btn ${exportFormat === 'csv' ? 'active' : ''}`} onClick={() => setExportFormat('csv')} aria-pressed={exportFormat === 'csv'}>CSV</button>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowExportModal(false)} className="cancel-btn">Cancel</button>
              <button onClick={handleExportData} className="action-btn">Download</button>
            </div>
          </div>
        </div>
      )}
       {showCreateEventModal && (
        <div className="disclaimer-overlay">
          <div className="create-modal">
            <h2>Create Custom Event</h2>
            <div className="create-form">
              <div className="form-group">
                <label htmlFor="event-date">Date</label>
                <input id="event-date" type="date" className="form-control" value={newEventData.date} onChange={(e) => handleNewEventInputChange('date', e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="event-activity">Activity</label>
                <input id="event-activity" type="text" className="form-control" value={newEventData.activity} onChange={(e) => handleNewEventInputChange('activity', e.target.value)} placeholder="e.g., Weapons Cleaning" />
              </div>
              <div className="form-group">
                <label htmlFor="event-squads">Squads</label>
                <div className="squad-selector-group">
                  <div className="squad-selector-item">
                    <input type="checkbox" id="all-squads" onChange={handleSelectAllSquads} checked={selectedSquads.length === squads.length} />
                    <label htmlFor="all-squads">All Squads</label>
                  </div>
                  {squads.map(squad => (
                    <div key={squad.id} className="squad-selector-item">
                      <input type="checkbox" id={`squad-${squad.id}`} checked={selectedSquads.includes(squad.id)} onChange={() => handleSquadSelection(squad.id)} />
                      <label htmlFor={`squad-${squad.id}`}>{squad.name}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="event-time">Time</label>
                <input id="event-time" type="text" className="form-control" value={newEventData.time} onChange={(e) => handleNewEventInputChange('time', e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="event-lead">Shift Lead</label>
                <input id="event-lead" type="text" className="form-control" value={newEventData.shiftLead} onChange={(e) => handleNewEventInputChange('shiftLead', e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="event-notes">Notes</label>
                <textarea id="event-notes" className="form-control" value={newEventData.notes} onChange={(e) => handleNewEventInputChange('notes', e.target.value)}></textarea>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={handleCloseCreateModal} className="cancel-btn">Cancel</button>
              <button onClick={handleCreateEvent} className="action-btn">Add Event</button>
            </div>
          </div>
        </div>
      )}
      <div className="classification-banner top-banner">UNCLASSIFIED</div>
      <header>
        <h1>Training Calendar</h1>
        <div className="last-edited-timestamp">{lastEdited ? `Last Saved: ${lastEdited.toLocaleString()}` : 'No changes saved yet.'}</div>
        <div className="calendar-controls">
           <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search events..." className="search-input" aria-label="Search training events"/>
            <div className="navigation-controls">
              <button onClick={() => handleNavigation('prev')} className="nav-btn">&laquo; Prev</button>
              <button onClick={() => handleNavigation('today')} className="nav-btn today-btn">Today</button>
              <button onClick={() => handleNavigation('next')} className="nav-btn">Next &raquo;</button>
            </div>
            <h2 className="current-date-display">{renderCurrentDateHeader()}</h2>
            <div className="view-switcher">
                <button onClick={() => setViewMode('year')} className={`view-btn ${viewMode === 'year' ? 'active' : ''}`}>Year</button>
                <button onClick={() => setViewMode('month')} className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}>Month</button>
                <button onClick={() => setViewMode('week')} className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}>Week</button>
            </div>
           <div className="main-actions">
              <button onClick={handleSave} className="action-btn">Save Calendar</button>
              <button onClick={() => setShowCreateEventModal(true)} className="action-btn">Create Event</button>
              <button onClick={() => setShowGenerateModal(true)} className="action-btn">Generate METL Schedule</button>
              <button onClick={handleOpenPrintModal} className="action-btn">Print Calendar</button>
              <button onClick={handleOpenExportModal} className="action-btn">Export Calendar</button>
           </div>
        </div>
      </header>
      <main>
        {renderCalendarView()}
      </main>
      <div className="classification-banner bottom-banner">UNCLASSIFIED</div>

      <div className="print-view" aria-hidden="true">
        <div className="print-header">
            <h1>Training Calendar - {printStartDate} to {printEndDate}</h1>
        </div>
        {printableEvents.length > 0 ? (
            printableEvents.map(({ date, squadEvents }) => (
                <div key={getDateKey(date)} className="print-day">
                    <h3>{date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                    {squadEvents.map(({ squadName, events }) => (
                        <div key={squadName} className="print-squad">
                            <h4>{squadName}</h4>
                            <table className="print-table">
                                <thead><tr><th>Activity</th><th>Time</th><th>Shift Lead</th><th>Status</th><th>Notes</th></tr></thead>
                                <tbody>
                                    {events.map(ev => (<tr key={ev.id}><td>{ev.activity}</td><td>{ev.time || 'N/A'}</td><td>{ev.shiftLead || 'N/A'}</td><td>{ev.status}</td><td>{ev.notes || 'N/A'}</td></tr>))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            ))
        ) : (<p>No events scheduled for the selected date range.</p>)}
      </div>
    </>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}