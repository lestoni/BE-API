// This can be put in different file name by resource when logic expands for this works

async function fetchContractById(contractModel, contractId) {
  const contract = await contractModel.findOne({where: { id: contractId }})
  return contract;
}


module.exports = {
  fetchContractById,
}