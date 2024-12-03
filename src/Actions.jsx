import useSWR from 'swr'

const fetcher = async (url, body) => {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    const data = await res.json()
    if (data.success) return data.results
    throw new Error(data.msg)
}

const Actions = () => {
    const { data: aoiData = [], error, revalidate } = useSWR(
        'http://10.11.33.122:1234/thirdAOI.php',
        () => fetcher('http://10.11.33.122:1234/thirdAOI.php', { action: 'get3oaoidata' }),
        { revalidateOnFocus: false, revalidateOnReconnect: false }
    )

    if (error) {
        console.error(error.message)
        return <div>商品搜尋失敗</div>
    }

    const searchThirdAoiData = () => {
        revalidate()
    }

    const searchByCondition = async (drawingNo, machineId) => {
        return await fetcher('http://10.11.33.122:1234/thirdAOI.php', { action: 'getDataByCondition', drawingNo, machineId })
    }

    const exportDataByCondition = async (drawingNo, machineId) => {
        return await fetcher('http://10.11.33.122:1234/thirdAOI.php', { action: 'exportDataByCondition', drawingNo, machineId })
    }

    const getDetailsByDate = async (deviceId, date) => {
        return await fetcher('http://10.11.33.122:1234/thirdAOI.php', {
            action: 'getDetailsByDate',
            deviceId,
            date
        })
    }

    const getBDDetailsByMachineStrip = async (deviceId, machineId, date, period = 'daily') => {
        return await fetcher('http://10.11.33.122:1234/thirdAOI.php', {
            action: 'getBDDetailsByMachineStrip',
            deviceId,
            machineId,
            date,
            periodType: period
        })
    }

    const sendEmail = async (emailData) => {
        return await fetcher('http://10.11.33.122:1234/thirdAOI.php', { action: 'mailAlert', emailData })
    }

    return {
        aoiData,
        searchThirdAoiData,
        searchByCondition,
        exportDataByCondition,
        getDetailsByDate,
        getBDDetailsByMachineStrip,
        sendEmail,
    }
}

export default Actions