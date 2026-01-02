from typing import List
from fastapi import APIRouter, Body, Request, status, HTTPException
from fastapi.encoders import jsonable_encoder
from bson import ObjectId
from app.models.item import ItemCreate, ItemInDB

router = APIRouter()

@router.post("/", response_description="Create a new evaluation item", status_code=status.HTTP_201_CREATED, response_model=ItemInDB)
async def create_item(request: Request, item: ItemCreate = Body(...)):
    item_dict = jsonable_encoder(item)
    new_item = await request.app.mongodb["items"].insert_one(item_dict)
    created_item = await request.app.mongodb["items"].find_one({"_id": new_item.inserted_id})
    created_item["_id"] = str(created_item["_id"]) # ObjectId 변환
    return created_item

@router.get("/", response_description="List all items", response_model=List[ItemInDB])
async def list_items(request: Request):
    items = []
    cursor = request.app.mongodb["items"].find()
    async for doc in cursor:
        doc["_id"] = str(doc["_id"]) # ObjectId 변환
        items.append(doc)
    return items

@router.delete("/{id}", response_description="Delete an item", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(id: str, request: Request):
    delete_result = await request.app.mongodb["items"].delete_one({"_id": ObjectId(id)})
    if delete_result.deleted_count == 1:
        return
    raise HTTPException(status_code=404, detail="Item not found")
