import {
  Flex, Box, Input, InputGroup, InputRightElement, Button, useDisclosure,
  Select, Icon, Text, Center, CheckboxGroup, Checkbox, Stack, useMediaQuery,
  Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, FormControl,
  DrawerBody, Link, Spinner, SelectField, Tooltip
} from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux'
import { useFormik } from "formik";
import { useState, useEffect } from "react";
import { axiosInstance } from '../../lib/api';
import { BiSearchAlt, BiReset } from 'react-icons/bi';
import { RiListCheck } from 'react-icons/ri';
import { BsFilterLeft } from 'react-icons/bs';
import { IoCartOutline } from "react-icons/io5";
import NextImage from 'next/image'
import ProductCard from './prouctcard/ProductCard';
import SideFilterCategory from './filter/filtercategory/SideFilterCategory';
import { useRouter } from 'next/router';

export default function ProductListing() {
  const { isOpen: isOpenCategory, onOpen: onOpenCategory, onClose: onCloseCategory } = useDisclosure()
  const autoRender = useSelector((state) => state.automateRendering)
  const [filtermobile] = useMediaQuery('(min-width: 1059px)')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const router = useRouter();
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState([])
  const [product, setProduct] = useState([])

  // --------------- for Filtering --------------- //
  const [pageStart, setPageStart] = useState(1)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(16)
  const [totalProduct, setTotalProduct] = useState(0)
  const [totalPage, setTotalPage] = useState(0)
  let routerQuery = router.query

  const formik = useFormik({
    initialValues: {
      searchName: ``,
    }
  })

  // --------------- Fetching Category --------------- //
  async function fetchCategory() {
    try {
      axiosInstance.get(`/category`)
        .then((res) => {
          setCategory(res.data.result)
          // const temp = res.data.result
          // console.log(temp)
        })
    } catch (err) {
      console.log(err)
    }
  };

  // --------------- Filtering Category Product --------------- //
  const setTheParams = async (category) => {
    if (routerQuery.category1 == category && routerQuery.category2 != category) {
      await router.push(`?category1&category2=${!routerQuery.category2 ? '' : routerQuery.category2}`);
    } else if (routerQuery.category1 != category && routerQuery.category2 == category) {
      await router.push(`?category1=${routerQuery.category1}&category2=`);
    } else if (!routerQuery.category1 && !routerQuery.category2) {
      await router.push(`?category1=${category}`);
    } else if (!routerQuery.category1 && routerQuery.category2) {
      await router.push(`?category1=${category}&category2=${routerQuery.category2}`);
    } else if (routerQuery.category1 && !routerQuery.category2) {
      await router.push(`?category1=${routerQuery.category1}&category2=${category}`);
    }
    // else if (routerQuery.category1 && routerQuery.category2) {

    // }
    if (!category) {
      await router.push(`/productlist`);
      routerQuery = {}
    }
    dispatch({
      type: "FETCH_RENDER",
      payload: { value: !autoRender.value }
    })
  }
  // console.log(router.query);
  // console.log(routerQuery.category1);
  // console.log(routerQuery.category2);
  // console.log(routerQuery.category3);
  // console.log(routerQuery);

  const renderCategory = () => {
    return category.map((val, index) => {
      return (
        <>
          <Button variant='link' onClick={() => setTheParams(val.category)}
            style={{ textDecoration: 'none' }} my='3px' w='full'>
            <Checkbox onClick={setTheParams}
              // checked={routerQuery.category1 || routerQuery.category2 || routerQuery.category3 == val.category ? true : false}
              colorScheme='green' my='3px' w='full'>
              <SideFilterCategory key={index}
                idcategory={val.id}
                category={val.category}
              />
            </Checkbox>
          </Button>
        </>
      )
    })
  }

  // --------------- Fetching Product --------------- //
  async function fetchProduct(filter) {
    const { category1, category2, category3, pages } = router.query
    let order = "";
    let sort = "";

    if (filter == 'product_asc') {
      order = 'product_name';
      sort = "ASC"
    } else if (filter == 'product_des') {
      order = 'product_name';
      sort = "DESC"
    } else if (filter == 'price_des') {
      order = 'selling_price';
      sort = "DESC"
    } else if (filter == 'price_asc') {
      order = 'selling_price';
      sort = "ASC"
    } else {
      order = '';
      sort = ""
    }

    try {
      // axiosInstance.get(`/comment/post/${id}?page=${startComment}&limit=${5}`)
      // get all product length
      axiosInstance.get(`/products?search=${formik.values.searchName}&sort&orderby&category=${category1}&category2=${category2}&category3=${category3}
      &limit=${limit}&page=${page}`)
        .then((res) => {
          const temp = res.data.result
          setTotalProduct(temp.length)
          // console.log(temp);
        })

      if (category1 || category2 || category3) {
        axiosInstance.get(`/products?search=${formik.values.searchName}&sort=${sort}&orderby=${order}&category=${category1}&category2=${category2}&category3=${category3}
        &limit=${limit}&page=${page}`)
          .then((res) => {
            setProduct(res.data.result)
            const temp = res.data.result
            // console.log(temp)
          })
      } else {
        axiosInstance.get(`/products?search=${formik.values.searchName}&sort=${sort}&orderby=${order}&category&category2&category3&limit=${limit}&page=${page}`)
          .then((res) => {
            setProduct(res.data.result)
            const temp = res.data.result
            console.log(temp)
          })
      }
    } catch (err) {
      console.log(err)
    }
  };

  const renderProduct = () => {
    return product.map((val, index) => {
      return (
        <ProductCard key={index}
          productId={val.id}
          productCode={val.product_code}
          productName={val.product_name}
          isiPerkemasan={val.isi_perkemasan}
          isDeleted={val.is_deleted}
          productImage={val.Product_images[0]?.image_url}
          stock={val.Product_stocks[0]?.stock}
          unit={val.Product_stocks[0]?.Unit?.unit_name}
          firstPrice={val.Product_stocks[0]?.first_price}
          sellingPrice={val.Product_stocks[0]?.selling_price}
          converted={val.Product_stocks[0]?.converted}
        />
      )
    })
  }

  useEffect(() => {
    fetchCategory()
    fetchProduct()
    setIsLoading(false);
    setTotalPage(Math.ceil(totalProduct / 16))

  }, [router.isReady]);

  console.log('total produk ' + totalProduct)
  console.log('total page ' + totalPage)
  console.log(limit);
  // console.log(page)

  const renderButton = () => {
    const array = [...Array(totalPage)]
    return (
      array.map(_ =>
        <Button size='sm' m='3px' onClick={() => setPage(pageStart++)} borderColor='#009B90' borderRadius='9px' bg='white' borderWidth='2px'
          _hover={{ bg: '#009B90', color: 'white' }}>{pageStart++}</Button>)
    )
  }

  // const renderButton = () => {
  //   return totalPage.map((val) => {
  //     return (
  //       <Button size='sm' m='3px' borderColor='#009B90' borderRadius='9px' bg='white' borderWidth='2px'
  //         _hover={{ bg: '#009B90', color: 'white' }}>{page}</Button>
  //     )
  //   })
  // }

  useEffect(() => {
    fetchProduct()
  }, [formik.values.searchName]);

  useEffect(() => {
    fetchProduct()
  }, [autoRender]);

  useEffect(() => {
    fetchProduct()
  }, [limit]);

  return (
    <>
      <Flex flexWrap={'wrap'} justifyContent={'center'}>
        <Box className='filter' mr='10px'>

          {/* ---------- Sort By name and Price ---------- */}
          <Box w='220px' m='10px' mb='20px' borderWidth='1px' boxShadow='md' bg='white' borderRadius='7px'>
            <Box alignItems={'center'} h='50px' borderTopRadius='7px' align='center' bg='#009B90' display='flex'>
              <Box h='25px' w='30px' ml='10px'>
                <Icon boxSize='6' as={BsFilterLeft} color='white' />
              </Box>
              <Box h='25px'>
                <Text mx='10px' fontWeight='bold' color='white'>
                  Urut Berdasarkan
                </Text>
              </Box>
            </Box>
            <Box p='15px'>
              {formik.values.sortByProduct}
              <FormControl isInvalid={formik.errors.sortByProduct}>
                <Select onChange={(event) => {
                  // async function submit() {
                  //   formik.setFieldValue("sortByProduct", event.target.value);
                  //   setTheOrderSort();
                  // }
                  // submit()
                  fetchProduct(event.target.value)
                }}>
                  <option value=''>-- Pilih --</option>
                  <option value='product_asc'>Nama A-Z</option>
                  <option value='product_des'>Nama Z-A</option>
                  <option value='price_des'>Harga Tertinggi</option>
                  <option value='price_asc'>Harga Terendah</option>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* ---------- Filter by Category ---------- */}
          <Box w='220px' m='10px' borderWidth='1px' boxShadow='md' bg='white' borderRadius='7px'>
            <Box alignItems={'center'} h='50px' borderTopRadius='7px' align='center' bg='#009B90' display='flex'>
              <Box h='25px' w='30px' ml='10px'>
                <Icon boxSize='6' as={RiListCheck} color='white' />
              </Box>
              <Box h='25px'>
                <Text mx='10px' fontWeight='bold' color='white'>
                  Filter Kategori
                </Text>
              </Box>
              <Box h='25px' ml='5px'>
                <Tooltip label='reset filter' fontSize='sm'>
                  <Button variant='link' onClick={() => setTheParams('')}>
                    <Icon boxSize='6' as={BiReset} color='white' />
                  </Button>
                </Tooltip>
              </Box>
            </Box>
            <Box px='20px' py='10px'>
              {renderCategory()}
            </Box>
          </Box>
        </Box>

        <Box mx='5px' my='10px' maxW='810px'>
          <Box display='flex' justifyContent='space-between' mb='10px'>

            {/* ---------- Pagination limit---------- */}
            <Box display='flex' alignSelf='center' ml='10px'>
              <Text alignSelf='center' mr='10px'>Show</Text>
              {formik.values.limiter}
              <Select size='sm' bg='white' borderRadius='5px'
                onChange={(event) => { setLimit(event.target.value) }}>
                <option value='16'>16</option>
                <option value='24'>24</option>
              </Select>
            </Box>

            {/* ---------- Search filter by Name ---------- */}
            <Box mx='10px'>
              {/* {formik.values.searchName} */}
              <FormControl isInvalid={formik.errors.searchName}>

                <InputGroup >
                  <Input placeholder="Cari Nama Produk" type='text' bg='white'
                    onChange={(event) => formik.setFieldValue("searchName", event.target.value)} />
                  <InputRightElement>
                    <Icon
                      fontSize="xl"
                      as={BiSearchAlt}
                      sx={{ _hover: { cursor: "pointer" } }}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </Box>

          </Box>

          {/* ---------- Filter Category Mobile ---------- */}
          <Box display='flex' justifyContent='space-evenly' hidden={filtermobile ? true : false}  >
            <Button onClick={onOpenCategory} w='180px' size='md' borderRadius='8px' bg='#009B90'
              _hover={{ background: '#02d1c2' }}>
              <Icon boxSize='5' as={RiListCheck} color='white' />
              <Text mx='10px' fontWeight='bold' color='white'>
                Filter Kategori
              </Text>
            </Button>
            <Drawer onClose={onCloseCategory} placement='top' isOpen={isOpenCategory} size='full'>
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton color='white' />
                <DrawerHeader bg='#009B90' color='white'>Filter Kategori</DrawerHeader>
                <DrawerBody>
                  <Box px='20px' py='10px'>
                    {renderCategory()}
                  </Box>
                </DrawerBody>
              </DrawerContent>
            </Drawer>

            {/* ---------- Sort by Name an Price Mobile ---------- */}
            <Button onClick={onOpen} size='md' w='180px' borderRadius='8px' bg='#009B90'
              _hover={{ background: '#02d1c2' }}>
              <Icon boxSize='5' as={BsFilterLeft} color='white' />
              <Text mx='10px' fontWeight='bold' color='white'>
                Urut Berdasarkan
              </Text>
            </Button>
            <Drawer onClose={onClose} placement='top' isOpen={isOpen} size='full'>
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton color='white' />
                <DrawerHeader bg='#009B90' color='white'>Urut Berdasarkan</DrawerHeader>
                <DrawerBody>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                    eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Consequat nisl vel pretium lectus quam id. Semper quis lectus
                    nulla at volutpat diam ut venenatis. Dolor morbi non arcu risus
                    quis varius quam quisque. Massa ultricies mi quis hendrerit dolor
                    magna eget est lorem. Erat imperdiet sed euismod nisi porta.
                    Lectus vestibulum mattis ullamcorper velit.
                  </p>
                </DrawerBody>
              </DrawerContent>
            </Drawer>
          </Box>

          {/* --------------- Product Rendering --------------- */}
          <Box display='flex' flexWrap={'wrap'} justifyContent='center'>
            {/* <ProductCard /> */}
            {isLoading ?
              <Flex minH={'100vh'} align={'center'} justify={'center'} bg='#F7FAFC' >
                <Spinner thickness='4px'
                  speed='0.65s'
                  emptyColor='gray.200'
                  color='blue.500'
                  size='xl' /> &nbsp; loading...
              </Flex>
              :
              <> {renderProduct()}</>
            }

            {/* -------------------- jangan dihapus -------------------- */}
            <Box w='180px' m='10px'>
            </Box>
            <Box w='180px' m='10px'>
            </Box>
            <Box w='180px' m='10px'>
            </Box>
            <Box w='180px' m='10px'>
            </Box>
          </Box>
          <Box display='flex' justifyContent='center'>
            <Button onClick={() => setPage(1)} size='sm' m='3px' borderColor='#009B90' borderRadius='9px' bg='white' borderWidth='2px'
              _hover={{ bg: '#009B90', color: 'white' }}>Prev</Button>
            {renderButton()}
            <Button size='sm' m='3px' borderColor='#009B90' borderRadius='9px' bg='white' borderWidth='2px'
              _hover={{ bg: '#009B90', color: 'white' }}>Next</Button>
          </Box>
        </Box>
      </Flex>
    </>
  )
}