import React, { useEffect, useState, useCallback } from 'react';
import EmployeeService from '../Services/EmpService';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Table, Dropdown, DropdownButton } from 'react-bootstrap';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const ListEmp = () => {
  const [employees, setEmployees] = useState([]);
  const [displayedEmployees, setDisplayedEmployees] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');

  const fetchAllEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const data = await EmployeeService.getAllEmployees();
      setEmployees(data.users);
      setDisplayedEmployees(data.users.slice(0, 10));
      setHasMore(data.users.length > 10);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllEmployees();
  }, [fetchAllEmployees]);

  useEffect(() => {
    const filterAndSortEmployees = () => {
      // Filtering employees
      const filteredEmployees = employees.filter(employee => {
        const genderMatch = selectedGender === 'All' || employee.gender.toLowerCase() === selectedGender.toLowerCase();
        const countryMatch = selectedCountry === 'All' || employee.address.country.toLowerCase() === selectedCountry.toLowerCase();
        return genderMatch && countryMatch;
      });

      // Sorting employees
      const sortedEmployees = filteredEmployees.sort((a, b) => {
        let valueA, valueB;
        if (sortField === 'fullName') {
          valueA = `${a.firstName} ${a.maidenName ? a.maidenName + ' ' : ''}${a.lastName}`.toLowerCase();
          valueB = `${b.firstName} ${b.maidenName ? b.maidenName + ' ' : ''}${b.lastName}`.toLowerCase();
        } else {
          valueA = a[sortField];
          valueB = b[sortField];
        }

        if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      return sortedEmployees;
    };

    const sortedFilteredEmployees = filterAndSortEmployees();
    setDisplayedEmployees(sortedFilteredEmployees.slice(0, page * 10));
    setHasMore(sortedFilteredEmployees.length > page * 10);
  }, [employees, sortField, sortOrder, page, selectedGender, selectedCountry]);

  const fetchMoreData = () => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handleSort = (field) => {
    setSortField(field);
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const handleGenderChange = (gender) => {
    setSelectedGender(gender);
    setPage(1); // Reset pagination
  };

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setPage(1);
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3">Employees</h1>
        <div className="d-flex align-items-center">
          <FilterAltIcon style={{ color: 'red', marginRight: '8px' }} />
          <DropdownButton id="country-dropdown" title={`Country: ${selectedCountry}`} bsSize="xsmall" className="me-2 btn-light">
            <Dropdown.Item onClick={() => handleCountryChange('All')}>All</Dropdown.Item>
            <Dropdown.Item onClick={() => handleCountryChange('United States')}>USA</Dropdown.Item>
            <Dropdown.Item onClick={() => handleCountryChange('Canada')}>Canada</Dropdown.Item>
          </DropdownButton>
          <DropdownButton id="gender-dropdown" title={`Gender: ${selectedGender}`}>
            <Dropdown.Item onClick={() => handleGenderChange('All')}>All</Dropdown.Item>
            <Dropdown.Item onClick={() => handleGenderChange('Male')}>Male</Dropdown.Item>
            <Dropdown.Item onClick={() => handleGenderChange('Female')}>Female</Dropdown.Item>
          </DropdownButton>
        </div>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <InfiniteScroll
        dataLength={displayedEmployees.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={loading && <h4>Loading...</h4>}
        endMessage={
          <p style={{ textAlign: 'center' }}>
            <b>You have reached to the end..</b>
          </p>
        }
      >
        <Table hover>
          <thead>
            <tr>
              <th>
                ID{' '}
                <ArrowUpwardIcon
                  sx={{ fontSize: 15 }}
                  style={{ color: sortField === 'id' && sortOrder === 'asc' ? 'red' : 'grey' }}
                  onClick={() => handleSort('id')}
                />
                <ArrowDownwardIcon
                  sx={{ fontSize: 15 }}
                  style={{ color: sortField === 'id' && sortOrder === 'desc' ? 'red' : 'grey' }}
                  onClick={() => handleSort('id')}
                />
              </th>
              <th>Image</th>
              <th>
                Full Name{' '}
                <ArrowUpwardIcon
                  sx={{ fontSize: 15 }}
                  style={{ color: sortField === 'fullName' && sortOrder === 'asc' ? 'red' : 'grey' }}
                  onClick={() => handleSort('fullName')}
                />
                <ArrowDownwardIcon
                  sx={{ fontSize: 15 }}
                  style={{ color: sortField === 'fullName' && sortOrder === 'desc' ? 'red' : 'grey' }}
                  onClick={() => handleSort('fullName')}
                />
              </th>
              <th>Demography</th>
              <th>Designation</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {displayedEmployees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.id}</td>
                <td>
                  <img
                    src={employee.image}
                    alt="avatar"
                    className="rounded-circle"
                    width="40"
                  />
                </td>
                <td>{`${employee.firstName} ${employee.maidenName ? employee.maidenName + ' ' : ''}${employee.lastName}`}</td>
                <td>{`${employee.gender}/${employee.age}`}</td>
                <td>{employee.company.title}</td>
                <td>{`${employee.address.state} ${employee.address.country}`}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </InfiniteScroll>
    </div>
  );
};

export default ListEmp;
