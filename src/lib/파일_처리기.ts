// CSV 및 XLSX 파일 파싱 / 표준 템플릿 생성 및 다운로드 모듈 (100% 클라이언트 사이드 구동)

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { 시군구_원천_데이터 } from './필수의료_타입';

/**
 * 파일 파싱 및 템플릿 처리 클래스
 */
export class 파일_처리기 {
  /**
   * 표준 CSV 템플릿 헤더 및 예시 데이터 정의
   */
  public static readonly standard_headers = [
    '시도코드',
    '시도명',
    '시군구코드',
    '시군구명',
    '인구수',
    '응급_60분_미도달_인구비율',
    '관내_응급_의료이용률',
    '분만_60분_미도달_인구비율',
    '관내_분만율',
    '소아_병상_공급비율',
    '소아_야간휴일_접근성지수',
  ];

  /**
   * 표준 템플릿 CSV 파일 생성 및 브라우저 다운로드 트리거
   */
  public static download_standard_template(): void {
    const example_rows = [
      {
        시도코드: '42',
        시도명: '강원특별자치도',
        시군구코드: '42720',
        시군구명: '홍천군',
        인구수: 67900,
        응급_60분_미도달_인구비율: 48.5,
        관내_응급_의료이용률: 26.4,
        분만_60분_미도달_인구비율: 52.1,
        관내_분만율: 21.3,
        소아_병상_공급비율: 38.0,
        소아_야간휴일_접근성지수: 25.0,
      },
      {
        시도코드: '11',
        시도명: '서울특별시',
        시군구코드: '11110',
        시군구명: '종로구',
        인구수: 141000,
        응급_60분_미도달_인구비율: 0.5,
        관내_응급_의료이용률: 96.5,
        분만_60분_미도달_인구비율: 1.0,
        관내_분만율: 95.0,
        소아_병상_공급비율: 99.0,
        소아_야간휴일_접근성지수: 98.0,
      },
    ];

    const csv_content = Papa.unparse(example_rows, {
      quotes: false,
      header: true,
    });

    // UTF-8 BOM 추가 (한글 엑셀 깨짐 방지)
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv_content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '필수의료_취약지_표준_입력양식_템플릿.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * CSV 파일을 파싱하여 시군구_원천_데이터 배열로 변환하는 함수
   */
  public static async parse_csv_file(file: File): Promise<시군구_원천_데이터[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        encoding: 'UTF-8',
        complete: (results) => {
          try {
            const parsed_data = this.normalize_raw_rows(results.data as Record<string, any>[]);
            resolve(parsed_data);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => reject(error),
      });
    });
  }

  /**
   * XLSX/XLS 엑셀 파일을 파싱하여 시군구_원천_데이터 배열로 변환하는 함수
   */
  public static async parse_excel_file(file: File): Promise<시군구_원천_데이터[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result;
          const workbook = XLSX.read(buffer, { type: 'binary' });
          const first_sheet_name = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[first_sheet_name];
          const json_data = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
          const parsed_data = this.normalize_raw_rows(json_data);
          resolve(parsed_data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  }

  /**
   * 유연한 컬럼명 매핑 및 데이터 정규화 함수
   */
  private static normalize_raw_rows(rows: Record<string, any>[]): 시군구_원천_데이터[] {
    const result_list: 시군구_원천_데이터[] = [];

    for (const row of rows) {
      if (!row) continue;

      // 시도명 / 시군구명 탐색
      const sido_name = String(row['시도명'] || row['시도'] || row['sido'] || row['광역'] || '미상').trim();
      const sgg_name = String(row['시군구명'] || row['시군구'] || row['sgg'] || row['지역명'] || '').trim();

      if (!sgg_name) continue;

      const sido_code = String(row['시도코드'] || row['sido_code'] || '00').trim();
      const sgg_code = String(row['시군구코드'] || row['sgg_code'] || row['adm_cd'] || '00000').trim();
      const population = Number(row['인구수'] || row['인구'] || row['population'] || 0);

      // 응급의료 지표 매핑
      const emergency_unreach = Number(
        row['응급_60분_미도달_인구비율'] ??
        row['응급60분미도달'] ??
        row['권역응급센터60분미도달'] ??
        row['emergency_unreach'] ??
        0
      );
      const emergency_ri = Number(
        row['관내_응급_의료이용률'] ??
        row['응급의료이용률'] ??
        row['응급RI'] ??
        row['emergency_ri'] ??
        50
      );

      // 분만모자 지표 매핑
      const delivery_unreach = Number(
        row['분만_60분_미도달_인구비율'] ??
        row['분만60분미도달'] ??
        row['분만실60분미도달'] ??
        row['delivery_unreach'] ??
        0
      );
      const delivery_rate = Number(
        row['관내_분만율'] ??
        row['분만율'] ??
        row['관내분만율'] ??
        row['delivery_rate'] ??
        50
      );

      // 소아중증 지표 매핑
      // 소아 지표 열이 없거나 빈 값이면 임의 기본값 대신 null (진단에서 제외)
      const 선택_숫자 = (v: unknown): number | null =>
        v === undefined || v === null || String(v).trim() === '' || isNaN(Number(v)) ? null : Number(v);
      const pediatric_bed = 선택_숫자(
        row['소아_병상_공급비율'] ??
        row['소아병상공급비율'] ??
        row['소아병상비율'] ??
        row['pediatric_bed']
      );
      const pediatric_access = 선택_숫자(
        row['소아_야간휴일_접근성지수'] ??
        row['소아야간휴일접근성'] ??
        row['야간휴일접근성'] ??
        row['pediatric_access']
      );

      result_list.push({
        시도코드: sido_code,
        시도명: sido_name,
        시군구코드: sgg_code,
        시군구명: sgg_name,
        인구수: population,
        응급_60분_미도달_인구비율: emergency_unreach,
        관내_응급_의료이용률: emergency_ri,
        분만_60분_미도달_인구비율: delivery_unreach,
        관내_분만율: delivery_rate,
        소아_병상_공급비율: pediatric_bed,
        소아_야간휴일_접근성지수: pediatric_access,
      });
    }

    return result_list;
  }
}
