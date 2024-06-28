import React, { useEffect, useState } from 'react';
import { Pagination } from '@mui/material';
import { PiMicrosoftExcelLogoFill as ExcelIcon } from 'react-icons/pi';
import styles from './UsersReportTable.module.css';
import PromotionsSearchSelect from '../PromotionsSearchSelect/PromotionsSearchSelect';
import useFetch from '../../hooks/useFetch';
import TableRow from '../TableRow';
import Table from '../Table/Table';
import { serverHost } from '../../config';
import useToken from '../../hooks/useToken';
import UserPicture from '../UserPicture';
import UserNameLink from '../UserNameLink/UserNameLink';

function UsersReportTable() {
  const [paginationItems, setPaginationItems] = useState();
  const [currentPage, setCurrentPage] = useState(0);
  const [promotionFilter, setPromotionFilter] = useState('');

  const token = useToken();
  const {
    callFetch: fetchReport,
    result: reportResult,
    loading: loadingReport,
  } = useFetch();

  const {
    callFetch: fetchReportFile,
    result: reportFile,
  } = useFetch();

  const downloadFileReport = () => {
    const searchParams = new URLSearchParams();
    if (promotionFilter?.length > 0) searchParams.append('promotion', promotionFilter);

    fetchReportFile({
      uri: `${serverHost}/user/report/file?${searchParams.toString()}`,
      headers: { authorization: token },
      toBlob: true,
      toJson: false,
    });
  };

  // Manejar paginación
  const handlePageChange = (e, page) => {
    setCurrentPage(page - 1);
  };

  useEffect(() => {
    // Realizar peticiones al servidor cuando se actualizan los filtros (o al inicio)
    const searchParams = new URLSearchParams({ page: currentPage });
    if (promotionFilter?.length > 0) searchParams.append('promotion', promotionFilter);

    fetchReport({
      uri: `${serverHost}/user/report?${searchParams.toString()}`,
      headers: { authorization: token },
    });
  }, [promotionFilter, currentPage]);

  useEffect(() => {
    // Descargar reporte
    if (reportFile) {
      const url = window.URL.createObjectURL(reportFile);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reporte_usuarios.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [reportFile]);

  useEffect(() => {
    // cambiar número en la paginación
    const media = matchMedia('(max-width:700px)');

    const handleMediaChange = (e) => {
      if (e.matches) setPaginationItems(0);
      else setPaginationItems(2);
    };

    media.onchange = handleMediaChange;
    handleMediaChange(media);

    return () => {
      media.onchange = null;
    };
  }, []);
  return (
    <div className={styles.usersReportTable}>
      <div className={styles.filterContainer}>
        <button
          type="button"
          title="Desgargar reporte"
          className={styles.excelButton}
          onClick={downloadFileReport}
        >
          <ExcelIcon fill="#16337F" className={styles.excelIcon} />
          <span>Descargar reporte</span>
        </button>
        <PromotionsSearchSelect
          disabled={loadingReport}
          onChange={(value) => setPromotionFilter(value)}
          value={promotionFilter}
        />
      </div>
      <Table header={['No.', '', 'Nombre', 'Promoción', 'Horas', 'Actividades']} loading={loadingReport} breakPoint="900px" showCheckbox={false}>
        {reportResult?.result.map((user, index) => (
          <TableRow id={user.id} key={user.id}>
            <td>{index + 1}</td>
            <td className={styles.pictureRow}>
              <UserPicture name={user.name} idUser={user.id} hasImage={user.hasImage ?? false} />
            </td>
            <td className={styles.nameRow}>
              <UserNameLink idUser={user.id} name={`${user.name} ${user.lastname ?? ''}`} />
            </td>
            <td className={styles.promotionRow}>{user.promotion}</td>
            <td>{user.totalHours}</td>
            <td>{user.activitiesCompleted}</td>
          </TableRow>
        ))}
      </Table>
      <Pagination
        count={reportResult?.pages ?? 0}
        siblingCount={paginationItems}
        className={styles.pagination}
        onChange={handlePageChange}
        page={currentPage + 1}
      />
    </div>
  );
}

export default UsersReportTable;
