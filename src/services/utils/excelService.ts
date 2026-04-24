import ExcelJS from 'exceljs';
import { Employee, Role, Service } from '@prisma/client';
import dayjs from 'dayjs';
import { PassThrough } from 'stream';

export interface EmployeeExportRow {
  id: string;
  name: string;
  surname: string;
  nickname: string | null;
  email: string;
  phone: string | null;
  position: string | null;
  roleName: string | null;
  startDate: string | null;
  isActive: boolean;
  services: string;
}

export class ExcelService {
  /**
   * Generate Employee Export Excel
   */
  // static async generateEmployeeExport(employees: any[], exportType: string = "all_relations"): Promise<Buffer> {
  //   const workbook = new ExcelJS.Workbook();
  //   const worksheet = workbook.addWorksheet('Employees');

  //   const baseColumns = [
  //     { header: 'Employee ID', key: 'id', width: 40 },
  //     { header: 'First Name*', key: 'name', width: 20 },
  //     { header: 'Last Name*', key: 'surname', width: 20 },
  //     { header: 'Nickname', key: 'nickname', width: 15 },
  //     { header: 'Email*', key: 'email', width: 30 },
  //     { header: 'Phone', key: 'phone', width: 15 },
  //     { header: 'Position', key: 'position', width: 20 },
  //     { header: 'Role*', key: 'roleName', width: 15 },
  //     { header: 'Start Date (DD-MM-YYYY)', key: 'startDate', width: 25 },
  //     // { header: 'Status (Active/Inactive)', key: 'status', width: 25 },
  //   ];

  //   let columns = [];

  //   if (exportType === 'all_relations') {
  //     columns = [
  //       { header: 'Employee ID', key: 'id', width: 40 },
  //       { header: 'Name (First,Last)', key: 'name', width: 30 },
  //       { header: 'Nickname', key: 'nickname', width: 15 },
  //       { header: 'Email*', key: 'email', width: 30 },
  //       { header: 'Phone', key: 'phone', width: 15 },
  //       { header: 'Position', key: 'position', width: 20 },
  //       { header: 'Role*', key: 'roleName', width: 15 },
  //       { header: 'Start Date (DD-MM-YYYY)', key: 'startDate', width: 25 },
  //       { header: 'Services', key: 'services', width: 40 },
  //     ];
  //   } else {
  //     columns = [
  //       { header: 'Employee ID', key: 'id', width: 40 },
  //       { header: 'First Name*', key: 'name', width: 20 },
  //       { header: 'Last Name*', key: 'surname', width: 20 },
  //       { header: 'Nickname', key: 'nickname', width: 15 },
  //       { header: 'Email*', key: 'email', width: 30 },
  //       { header: 'Phone', key: 'phone', width: 15 },
  //       { header: 'Position', key: 'position', width: 20 },
  //       { header: 'Role*', key: 'roleName', width: 15 },
  //       { header: 'Start Date (DD-MM-YYYY)', key: 'startDate', width: 25 },
  //     ];

  //     if (exportType === 'no_services') {
  //       columns.push({ header: 'Working Days', key: 'workingDays', width: 40 });
  //       columns.push({ header: 'Leaves', key: 'leaves', width: 40 });
  //     }
  //   }


  //   worksheet.columns = columns;

  //   worksheet.getRow(1).font = { bold: true };
  //   worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  //   employees.forEach((emp) => {
  //     const row: any = {
  //       id: emp.id,
  //       nickname: emp.nickname,
  //       email: emp.email,
  //       phone: emp.phone,
  //       position: emp.position,
  //       roleName: emp.role?.name || '',
  //       startDate: emp.startDate ? dayjs(emp.startDate).format('DD-MM-YYYY') : '',
  //     };

  //     if (exportType === 'all_relations') {
  //       row.name = `${emp.name},${emp.surname}`.replace(/^,|,$/g, '');
  //       const serviceNames = emp.services?.map((s: any) => s.name).join(', ') || '';
  //       row.services = serviceNames;
  //     } else {
  //       row.name = emp.name;
  //       row.surname = emp.surname;
  //     }

  //     if (exportType === 'no_services') {
  //       row.workingDays = emp.workingDays?.map((d: any) => `${d.dayOfWeek}: ${d.timeSlots?.map((t: any) => `${t.startTime}-${t.endTime}`).join(', ') || 'Off'}`).join('; ') || '';
  //       row.leaves = emp.leaves?.map((l: any) => `${dayjs(l.startDate).format('DD-MM-YYYY')} to ${dayjs(l.endDate).format('DD-MM-YYYY')} (${l.leaveType})`).join('; ') || '';
  //     }

  //     worksheet.addRow(row);
  //   });

  //   return await workbook.xlsx.writeBuffer() as unknown as Buffer;
  // }

  /**
   * Generate Employee Export CSV
   */
  // static async generateEmployeeExportCSV(employees: any[], exportType: string = "all_relations"): Promise<Buffer> {
  //   let headers = [];

  //   if (exportType === 'all_relations') {
  //     headers = [
  //       'Employee ID',
  //       'Name (First,Last)',
  //       'Nickname',
  //       'Email',
  //       'Phone',
  //       'Position',
  //       'Role',
  //       'Start Date',
  //       'Services',
  //     ];
  //   } else {
  //     headers = [
  //       'Employee ID',
  //       'First Name',
  //       'Last Name',
  //       'Nickname',
  //       'Email',
  //       'Phone',
  //       'Position',
  //       'Role',
  //       'Start Date',
  //     ];
  //   }

  //   if (exportType === 'no_services') {
  //     headers.push('Working Days');
  //     headers.push('Leaves');
  //   }

  //   const escapeCSV = (str: string | null | undefined): string => {
  //     if (str === null || str === undefined) return '';
  //     const stringValue = String(str);
  //     if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
  //       return `"${stringValue.replace(/"/g, '""')}"`;
  //     }
  //     return stringValue;
  //   };

  //   const rows: string[] = [];
  //   rows.push(headers.map(escapeCSV).join(','));

  //   employees.forEach((emp) => {
  //     let row: string[] = [];

  //     if (exportType === 'all_relations') {
  //       row = [
  //         escapeCSV(emp.id),
  //         `${escapeCSV(emp.name)},${escapeCSV(emp.surname)}`.replace(/^,|,$/g, ''),
  //         escapeCSV(emp.nickname),
  //         escapeCSV(emp.email),
  //         escapeCSV(emp.phone),
  //         escapeCSV(emp.position),
  //         escapeCSV(emp.role?.name || ''),
  //         escapeCSV(emp.startDate ? dayjs(emp.startDate).format('DD-MM-YYYY') : ''),
  //         escapeCSV(emp.services?.map((s: any) => s.name).join(', ')),
  //       ];
  //     } else {
  //       row = [
  //         escapeCSV(emp.id),
  //         escapeCSV(emp.name),
  //         escapeCSV(emp.surname),
  //         escapeCSV(emp.nickname),
  //         escapeCSV(emp.email),
  //         escapeCSV(emp.phone),
  //         escapeCSV(emp.position),
  //         escapeCSV(emp.role?.name || ''),
  //         escapeCSV(emp.startDate ? dayjs(emp.startDate).format('DD-MM-YYYY') : ''),
  //       ];

  //       if (exportType === 'no_services') {
  //         row.push(escapeCSV(emp.workingDays?.map((d: any) => `${d.dayOfWeek}: ${d.timeSlots?.map((t: any) => `${t.startTime}-${t.endTime}`).join(', ') || 'Off'}`).join('; ')));
  //         row.push(escapeCSV(emp.leaves?.map((l: any) => `${dayjs(l.startDate).format('DD-MM-YYYY')} to ${dayjs(l.endDate).format('DD-MM-YYYY')} (${l.leaveType})`).join('; ')));
  //       }
  //     }

  //     rows.push(row.join(','));
  //   });

  //   return Buffer.from(rows.join('\n'), 'utf-8');
  // }


  /**
   * Generate Employee Export Excel with WorkingDays and Leaves
   */
  static async generateEmployeeWithScheduleExport(employees: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Employees');

    const columns = [
      { header: 'Employee ID', key: 'id', width: 40 },
      { header: 'First Name*', key: 'name', width: 20 },
      { header: 'Last Name*', key: 'surname', width: 20 },
      { header: 'Nickname', key: 'nickname', width: 15 },
      { header: 'Email*', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Position', key: 'position', width: 20 },
      { header: 'Role*', key: 'roleName', width: 15 },
      { header: 'Start Date (DD-MM-YYYY)', key: 'startDate', width: 25 },
      { header: 'Status*', key: 'status', width: 15 },
      { header: 'Services', key: 'services', width: 40 },
      { header: 'Monday', key: 'mon', width: 25 },
      { header: 'Tuesday', key: 'tue', width: 25 },
      { header: 'Wednesday', key: 'wed', width: 25 },
      { header: 'Thursday', key: 'thu', width: 25 },
      { header: 'Friday', key: 'fri', width: 25 },
      { header: 'Saturday', key: 'sat', width: 25 },
      { header: 'Sunday', key: 'sun', width: 25 },
      { header: 'Leaves', key: 'leaves', width: 40 },
    ];

    worksheet.columns = columns;

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    const dayMap: Record<string, string> = {
      'MON': 'mon',
      'TUE': 'tue',
      'WED': 'wed',
      'THU': 'thu',
      'FRI': 'fri',
      'SAT': 'sat',
      'SUN': 'sun',
    };

    employees.forEach((emp) => {
      const row: any = {
        id: emp.id,
        name: emp.name,
        surname: emp.surname,
        nickname: emp.nickname,
        email: emp.email,
        phone: emp.phone,
        position: emp.position,
        roleName: emp.role?.name || '',
        startDate: emp.startDate ? dayjs(emp.startDate).format('DD-MM-YYYY') : '',
        status: emp.isActive ? 'Active' : 'Inactive',
        services: emp.services?.map((s: any) => s.name).join(', ') || '',
      };

      const workingDaysMap: Record<string, string> = {};
      if (emp.workingDays && Array.isArray(emp.workingDays)) {
        emp.workingDays.forEach((wd: any) => {
          const dayName = dayMap[wd.dayOfWeek as string];
          if (dayName) {
            if (wd.isWorking && wd.timeSlots && wd.timeSlots.length > 0) {
              workingDaysMap[dayName] = wd.timeSlots
                .map((t: any) => `${t.startTime}-${t.endTime}`)
                .join(', ');
            } else {
              workingDaysMap[dayName] = 'Off';
            }
          }
        });
      }

      row.mon = workingDaysMap['mon'] || 'Off';
      row.tue = workingDaysMap['tue'] || 'Off';
      row.wed = workingDaysMap['wed'] || 'Off';
      row.thu = workingDaysMap['thu'] || 'Off';
      row.fri = workingDaysMap['fri'] || 'Off';
      row.sat = workingDaysMap['sat'] || 'Off';
      row.sun = workingDaysMap['sun'] || 'Off';

      row.leaves = '';
      if (emp.leaves && Array.isArray(emp.leaves)) {
        row.leaves = emp.leaves
          .map((l: any) => `${dayjs(l.startDate).format('DD-MM-YYYY')} to ${dayjs(l.endDate).format('DD-MM-YYYY')} (${l.leaveType})`)
          .join('; ');
      }

      worksheet.addRow(row);
    });

    return await workbook.xlsx.writeBuffer() as unknown as Buffer;
  }

  /**
   * Generate Employee Export CSV with WorkingDays and Leaves
   */
  static async generateEmployeeWithScheduleExportCSV(employees: any[]): Promise<Buffer> {
    const headers = [
      'Employee ID',
      'First Name',
      'Last Name',
      'Nickname',
      'Email',
      'Phone',
      'Position',
      'Role',
      'Start Date',
      'Status*',
      'Services',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
      'Leaves',
    ];

    const escapeCSV = (str: string | null | undefined): string => {
      if (str === null || str === undefined) return '';
      const stringValue = String(str);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const rows: string[] = [];
    rows.push(headers.map(escapeCSV).join(','));

    const dayMap: Record<string, string> = {
      'MON': 'mon',
      'TUE': 'tue',
      'WED': 'wed',
      'THU': 'thu',
      'FRI': 'fri',
      'SAT': 'sat',
      'SUN': 'sun',
    };

    employees.forEach((emp) => {
      const workingDaysMap: Record<string, string> = {};
      if (emp.workingDays && Array.isArray(emp.workingDays)) {
        emp.workingDays.forEach((wd: any) => {
          const dayName = dayMap[wd.dayOfWeek as string];
          if (dayName) {
            if (wd.isWorking && wd.timeSlots && wd.timeSlots.length > 0) {
              workingDaysMap[dayName] = wd.timeSlots
                .map((t: any) => `${t.startTime}-${t.endTime}`)
                .join(', ');
            } else {
              workingDaysMap[dayName] = 'Off';
            }
          }
        });
      }

      const row = [
        escapeCSV(emp.id),
        escapeCSV(emp.name),
        escapeCSV(emp.surname),
        escapeCSV(emp.nickname),
        escapeCSV(emp.email),
        escapeCSV(emp.phone),
        escapeCSV(emp.position),
        escapeCSV(emp.role?.name || ''),
        escapeCSV(emp.startDate ? dayjs(emp.startDate).format('DD-MM-YYYY') : ''),
        escapeCSV(emp.isActive ? 'Active' : 'Inactive'),
        escapeCSV(emp.services?.map((s: any) => s.name).join(', ') || ''),
        escapeCSV(workingDaysMap['mon'] || 'Off'),
        escapeCSV(workingDaysMap['tue'] || 'Off'),
        escapeCSV(workingDaysMap['wed'] || 'Off'),
        escapeCSV(workingDaysMap['thu'] || 'Off'),
        escapeCSV(workingDaysMap['fri'] || 'Off'),
        escapeCSV(workingDaysMap['sat'] || 'Off'),
        escapeCSV(workingDaysMap['sun'] || 'Off'),
        escapeCSV(emp.leaves?.map((l: any) => `${dayjs(l.startDate).format('DD-MM-YYYY')} to ${dayjs(l.endDate).format('DD-MM-YYYY')} (${l.leaveType})`).join('; ') || ''),
      ];

      rows.push(row.join(','));
    });

    return Buffer.from(rows.join('\n'), 'utf-8');
  }

  /**
   * Parse Service Import Excel
   */
  static async generateServiceExportExcel(services: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Services');

    // Define Columns
    worksheet.columns = [
      { header: 'Service ID', key: 'id', width: 40 },
      { header: 'Name*', key: 'name', width: 30 },
      { header: 'Category*', key: 'category', width: 20 },
      { header: 'Price*', key: 'price', width: 15 },
      { header: 'Discount', key: 'discount', width: 15 },
      { header: 'Duration (minutes)*', key: 'durationMinutes', width: 20 },
      { header: 'Buffer Time (minutes)', key: 'bufferTime', width: 20 },
      { header: 'Status*', key: 'status', width: 15 },
      { header: 'Detail', key: 'detail', width: 40 },
      { header: 'Note', key: 'note', width: 30 },
    ];

    // Style Header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add Data
    services.forEach((service) => {
      worksheet.addRow({
        id: service.id,
        name: service.name,
        category: service.category,
        price: service.price,
        discount: service.discount,
        durationMinutes: service.durationMinutes,
        bufferTime: service.bufferTime,
        status: service.active ? 'Active' : 'Inactive',
        detail: service.detail || '',
        note: service.note || '',
      });
    });

    return await workbook.xlsx.writeBuffer() as unknown as Buffer;
  }

    /**
   * Generate Service Export CSV (Simple - Services Only)
   */
  static async generateServiceExportCSV(services: any[]): Promise<Buffer> {
    const headers = [
      'Service ID',
      'Name*',
      'Category*',
      'Price*',
      'Discount',
      'Duration (minutes)*',
      'Buffer Time (minutes)',
      'Status*',
      'Detail',
      'Note',
    ];

    const escapeCSV = (str: string | null | undefined): string => {
      if (str === null || str === undefined) return '';
      const stringValue = String(str);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const rows: string[] = [];
    rows.push(headers.map(escapeCSV).join(','));

    services.forEach((service) => {
      const row = [
        escapeCSV(service.id),
        escapeCSV(service.name),
        escapeCSV(service.category),
        escapeCSV(service.price),
        escapeCSV(service.discount),
        escapeCSV(service.durationMinutes),
        escapeCSV(service.bufferTime),
        escapeCSV(service.active ? 'Active' : 'Inactive'),
        escapeCSV(service.detail),
        escapeCSV(service.note),
      ];
      rows.push(row.join(','));
    });

    return Buffer.from(rows.join('\n'), 'utf-8');
  }

  /**
   * Parse Service Import Excel or CSV
   */
  static async parseServiceImport(buffer: Buffer, isCsv: boolean = false): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    if (isCsv) {
      const bufferStream = new PassThrough();
      bufferStream.end(buffer);
      await workbook.csv.read(bufferStream);
    } else {
      await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
    }
    const worksheet = workbook.getWorksheet(1);
    const data: any[] = [];

    if (!worksheet) return [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip Header

      const rowData: any = {
        id: row.getCell(1).text,
        name: row.getCell(2).text,
        category: row.getCell(3).text,
        price: parseFloat(row.getCell(4).text) || 0,
        discount: parseFloat(row.getCell(5).text) || 0,
        durationMinutes: parseInt(row.getCell(6).text) || 0,
        bufferTime: parseInt(row.getCell(7).text) || 0,
        status: row.getCell(8).text,
        detail: row.getCell(9).text,
        note: row.getCell(10).text,
      };

      if (rowData.name) {
        data.push(rowData);
      }
    });

    return data;
  }

  /**
   * Parse Employee Import Excel or CSV
   */
  static async parseEmployeeImport(buffer: Buffer, isCsv: boolean = false): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    if (isCsv) {
      const bufferStream = new PassThrough();
      bufferStream.end(buffer);
      await workbook.csv.read(bufferStream);
    } else {
      await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
    }
    const worksheet = workbook.getWorksheet(1);
    const data: any[] = [];

    if (!worksheet) return [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip Header

      const rowData: any = {
        id: row.getCell(1).text,
        name: row.getCell(2).text,
        surname: row.getCell(3).text,
        nickname: row.getCell(4).text,
        email: row.getCell(5).text,
        phone: row.getCell(6).text,
        position: row.getCell(7).text,
        roleName: row.getCell(8).text,
        startDate: row.getCell(9).text,
        status: row.getCell(10).text,
        services: row.getCell(11).text,
        workingDays: {
          MON: row.getCell(12).text || '',
          TUE: row.getCell(13).text || '',
          WED: row.getCell(14).text || '',
          THU: row.getCell(15).text || '',
          FRI: row.getCell(16).text || '',
          SAT: row.getCell(17).text || '',
          SUN: row.getCell(18).text || '',
        },
        leaves: row.getCell(19).text || '',
      };

      if (rowData.email) {
        data.push(rowData);
      }
    });

    return data;
  }
}
