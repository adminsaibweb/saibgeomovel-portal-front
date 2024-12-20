import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  height: calc(100vh - 210px);

  display: flex;
`;

export const ColumnDay = styled.div`
  height: 100%;
  width: 100px;
  border: 1px solid #8e44ad;
  flex: 1;
  max-height: calc(100vh - 210px);
  overflow-y: auto;
`;
