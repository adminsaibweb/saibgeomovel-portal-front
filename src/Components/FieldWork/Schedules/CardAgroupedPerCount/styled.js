import styled from 'styled-components';

export const Container = styled.div`
  width: 400px;
  border: 1px solid #8e44ad;
  border-radius: 5px;

  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
`;

export const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;

  border-bottom: 1px solid #ddd;
  margin-bottom: 5px;

  background: #7e3a9d;
`;

export const Professional = styled.p`
  font-weight: 500;
  font-size: 1.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* line-height: 1rem; */
  text-transform: capitalize;
  color: #fff;
  padding: 0 5px;
`;

export const Status = styled.p`
  font-weight: 300;
  font-size: 1.1rem;
`;

export const Attendance = styled.p`
  font-weight: 500;
  font-size: 1.1rem;
  white-space: nowrap;
  /* line-height: 1rem; */
  color: #fff;
  padding: 0 5px;
`;

export const FooterCard = styled.div`
  display: flex;
  justify-content: ${(props) => props.justifyContent};
  width: 100%;
  margin-top: 5px;
  padding: 0 5px;
  i {
    /* color: #7e3a9d; */
  }
  div,
  a {
    color: #7e3a9d;
    /* color: #858585; */
    display: flex;
    align-items: center;
    font-weight: 500;
    cursor: pointer;
    padding: 3px 0;

    i:nth-child(1) {
      padding-right: 2px;
    }
  }
`;
